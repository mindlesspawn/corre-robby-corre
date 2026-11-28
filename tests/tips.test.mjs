import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createTipSession, TIP_PRODUCTS } from '../src/tip-session.js';

const deferred = () => { let resolve, reject; const promise = new Promise((a,b)=>{resolve=a;reject=b;}); return {promise,resolve,reject}; };
function harness(overrides = {}) {
  const calls = [];
  const bridge = {
    async beginParentGate() { return { challengeId:'challenge', a:7, b:8 }; },
    async completeParentGate({answer}) { if(answer !== 56) throw {code:'AUTH_REQUIRED'}; return {parentToken:'parent'}; },
    async endParentSession(args) { calls.push(['close',args]); },
    async getProducts() { return { products: TIP_PRODUCTS.map((p,i)=>({id:p.id,displayPrice:['$19.00 MXN','$59.00 MXN','$99.00 MXN'][i]})) }; },
    async purchase(args) { calls.push(['purchase',args]); return {status:'purchased'}; },
    ...overrides,
  };
  const states=[];
  const tips=createTipSession(bridge,s=>states.push(s));
  const ready=async()=>{await tips.begin();assert.equal(await tips.authorize(56),true);await tips.load();};
  return {tips,bridge,calls,states,ready};
}

test('no purchase before parent authorization, catalog loading, or for an unknown product',async()=>{
  const h=harness();
  assert.equal(await h.tips.purchase(TIP_PRODUCTS[0].id),false);
  await h.tips.begin();
  assert.equal(await h.tips.authorize(12),false);
  assert.equal(await h.tips.purchase(TIP_PRODUCTS[0].id),false);
  await h.ready();
  assert.equal(await h.tips.purchase('other.app.product'),false);
  assert.equal(h.calls.some(c=>c[0]==='purchase'),false);
});

test('uses exact localized Apple prices, keeps product order and excludes unrelated products',async()=>{
  const h=harness({async getProducts(){return {products:[
    {id:'unknown',displayPrice:'$1'},
    {id:TIP_PRODUCTS[2].id,displayPrice:'99,00 MXN'},
    {id:TIP_PRODUCTS[0].id,displayPrice:'19,00 MXN'},
    {id:TIP_PRODUCTS[1].id,displayPrice:''},
  ]};}});
  await h.ready();
  assert.deepEqual(h.tips.state.products.map(p=>p.displayPrice),['19,00 MXN','99,00 MXN']);
  await h.tips.purchase(TIP_PRODUCTS[0].id);
  assert.deepEqual(h.calls.find(c=>c[0]==='purchase')[1],{parentToken:'parent',productId:TIP_PRODUCTS[0].id,displayPrice:'19,00 MXN'});
});

test('double tapping sends one purchase and a second tip requires a new parent check',async()=>{
  const charge=deferred();
  const h=harness({purchase(args){h.calls.push(['purchase',args]);return charge.promise;}});
  await h.ready();
  const first=h.tips.purchase(TIP_PRODUCTS[0].id);
  assert.equal(await h.tips.purchase(TIP_PRODUCTS[0].id),false);
  charge.resolve({status:'purchased'});
  await first;
  assert.equal(h.calls.filter(c=>c[0]==='purchase').length,1);
  assert.equal(h.tips.state.status,'purchased');
  assert.equal(await h.tips.purchase(TIP_PRODUCTS[0].id),false);
});

test('cancelled and pending payments do not report success or retry automatically',async()=>{
  for(const status of ['cancelled','pending']){
    let count=0;
    const h=harness({async purchase(){count++;return {status};}});
    await h.ready();await h.tips.purchase(TIP_PRODUCTS[0].id);
    assert.equal(h.tips.state.status,status);
    assert.equal(await h.tips.purchase(TIP_PRODUCTS[0].id),false);
    assert.equal(count,1);
  }
});

test('verification, storefront, restriction, authorization and network failures stay distinct',async()=>{
  for(const [code,status] of Object.entries({UNVERIFIED:'unverified',PRICE_CHANGED:'priceChanged',RESTRICTED:'restricted',AUTH_REQUIRED:'auth',UNAVAILABLE:'unavailable',UNKNOWN:'failed'})){
    const h=harness({async purchase(){throw {code};}});
    await h.ready();await h.tips.purchase(TIP_PRODUCTS[0].id);
    assert.equal(h.tips.state.status,status);
    assert.equal(h.tips.state.products.length,0);
  }
});

test('empty or failed catalog does not offer made-up prices',async()=>{
  for(const getProducts of [async()=>({products:[]}),async()=>{throw {code:'UNAVAILABLE'};}]){
    const h=harness({getProducts});await h.ready();
    assert.equal(h.tips.state.status,'unavailable');
    assert.equal(h.tips.state.products.length,0);
  }
});

test('closing during catalog loading cannot reopen tips or leave them authorized',async()=>{
  const fetch=deferred(),h=harness({getProducts:()=>fetch.promise});
  await h.tips.begin();await h.tips.authorize(56);
  const loading=h.tips.load();h.tips.close();
  fetch.resolve({products:[{id:TIP_PRODUCTS[0].id,displayPrice:'$19 MXN'}]});await loading;
  assert.equal(h.tips.state.phase,'closed');
  assert.equal(await h.tips.purchase(TIP_PRODUCTS[0].id),false);
});

test('late payment completion stays silent after leaving the adult area',async()=>{
  const charge=deferred(),h=harness({purchase:()=>charge.promise});await h.ready();
  const payment=h.tips.purchase(TIP_PRODUCTS[0].id);h.tips.close();charge.resolve({status:'purchased'});await payment;
  assert.equal(h.tips.state.phase,'closed');
  assert.equal(h.tips.state.status,null);
});

test('late gate authorization is revoked rather than applied to a newer screen',async()=>{
  const auth=deferred(),h=harness({completeParentGate:()=>auth.promise});
  await h.tips.begin();const authorizing=h.tips.authorize(56);h.tips.close();
  auth.resolve({parentToken:'late-grant'});assert.equal(await authorizing,false);
  assert.ok(h.calls.some(c=>c[0]==='close'&&c[1].parentToken==='late-grant'));
});

test('JavaScript and native product IDs stay identical to the store setup catalog',async()=>{
  const swift=await readFile(new URL('../ios/TipRules/Sources/TipRules/TipRules.swift',import.meta.url),'utf8');
  const catalog=JSON.parse(await readFile(new URL('../store/tip-products.json',import.meta.url),'utf8'));
  const ids=TIP_PRODUCTS.map(p=>p.id);
  assert.deepEqual([...swift.matchAll(/"(com\.mindlesspawn[^"\n]+)"/g)].map(m=>m[1]),ids);
  assert.deepEqual(catalog.products.map(p=>p.id),ids);
  assert.ok(catalog.requiredTerritories.includes('MEX'));
});
