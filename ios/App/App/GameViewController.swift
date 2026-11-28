import Capacitor

class GameViewController: CAPBridgeViewController {
    override func capacitorDidLoad() {
        bridge?.registerPluginInstance(TipJarPlugin())
    }
}
