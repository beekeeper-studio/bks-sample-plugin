export default class SamplePlugin {
  async onLoad() {
    console.log("Sample plugin onLoad");
  }

  async onDestroy() {
    console.log("Sample plugin onDestroy")
  }
}
