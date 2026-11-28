// Purchase state is deliberately separate from game progress. Tips never grant rewards.
export const TIP_PRODUCTS = [
  { id: 'com.mindlesspawn.correrobbycorre.tip.small', label: 'tipSmall' },
  { id: 'com.mindlesspawn.correrobbycorre.tip.medium', label: 'tipMedium' },
  { id: 'com.mindlesspawn.correrobbycorre.tip.large', label: 'tipLarge' },
];

const errorStatus = (error) => ({
  AUTH_REQUIRED: 'auth', RESTRICTED: 'restricted', PRICE_CHANGED: 'priceChanged',
  UNAVAILABLE: 'unavailable', BUSY: 'busy', UNVERIFIED: 'unverified',
}[error?.code] ?? 'failed');

export function createTipSession(bridge, changed = () => {}) {
  let revision = 0, challengeId = null, parentToken = null;
  let state = { phase: 'closed', products: [], status: null };
  const update = (patch) => { state = { ...state, ...patch }; changed(state); };
  const close = () => {
    revision++;
    const credentials = { challengeId, parentToken };
    challengeId = parentToken = null;
    update({ phase: 'closed', products: [], status: null });
    if (credentials.challengeId || credentials.parentToken) bridge.endParentSession(credentials).catch(() => {});
  };
  return {
    get state() { return state; },
    close,
    async begin() {
      close();
      const mine = revision;
      update({ phase: 'gateLoading' });
      try {
        const challenge = await bridge.beginParentGate();
        if (mine !== revision) {
          bridge.endParentSession({ challengeId: challenge.challengeId }).catch(() => {});
          return null;
        }
        challengeId = challenge.challengeId;
        update({ phase: 'gate' });
        return challenge;
      } catch (error) {
        if (mine === revision) update({ phase: 'error', status: errorStatus(error) });
        return null;
      }
    },
    async authorize(answer) {
      if (state.phase !== 'gate' || !Number.isInteger(answer)) return false;
      const mine = revision;
      update({ phase: 'authorizing' });
      try {
        const grant = await bridge.completeParentGate({ challengeId, answer });
        if (mine !== revision) {
          bridge.endParentSession({ parentToken: grant.parentToken }).catch(() => {});
          return false;
        }
        parentToken = grant.parentToken;
        update({ phase: 'loading' });
        return true;
      } catch (error) {
        if (mine === revision) update({ phase: 'error', status: errorStatus(error) });
        return false;
      }
    },
    async load() {
      if (!parentToken || state.phase !== 'loading') return;
      const mine = revision;
      try {
        const result = await bridge.getProducts({ parentToken });
        if (mine !== revision) return;
        const products = TIP_PRODUCTS.flatMap((definition) => {
          const product = result.products?.find((p) => p.id === definition.id);
          return product && typeof product.displayPrice === 'string' && product.displayPrice.trim()
            ? [{ ...definition, displayPrice: product.displayPrice }] : [];
        });
        update({ products, phase: products.length ? 'ready' : 'error', status: products.length ? null : 'unavailable' });
      } catch (error) {
        if (mine === revision) update({ phase: 'error', products: [], status: errorStatus(error) });
      }
    },
    async purchase(productId) {
      const product = state.products.find((p) => p.id === productId);
      if (!parentToken || state.phase !== 'ready' || !product) return false;
      const mine = revision, credentials = { parentToken };
      update({ phase: 'purchasing', status: null });
      try {
        const result = await bridge.purchase({ ...credentials, productId, displayPrice: product.displayPrice });
        if (mine === revision) update({ phase: 'finished', products: [], status: ['purchased', 'cancelled', 'pending'].includes(result.status) ? result.status : 'failed' });
      } catch (error) {
        if (mine === revision) update({ phase: 'error', products: [], status: errorStatus(error) });
      } finally {
        // One parent check per attempt, including failures/cancellations. Never retry a charge automatically.
        bridge.endParentSession(credentials).catch(() => {});
        if (mine === revision) parentToken = null;
      }
      return true;
    },
  };
}
