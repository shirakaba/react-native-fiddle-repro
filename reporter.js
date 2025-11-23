const {
  stdin: { isTTY: interactive },
  stdout,
} = require("node:process");
const { styleText } = require("node:util");
const { Terminal, TerminalReporter } = require("metro");

class FiddleReporter {
  impl = new TerminalReporter(new Terminal(stdout));

  /**
   * @param {import("metro").ReportableEvent} event
   */
  update(event) {
    this.impl.update(event);

    // No need to call reportEvent(), as rnx-cli handles that already.

    // https://github.com/facebook/react-native/blob/55a5b6b0156bfe81143caad6b0e69924939045e6/packages/community-cli-plugin/src/commands/start/runServer.js#L135-L139
    if (interactive && event.type === "initialize_done") {
      this.impl.update({
        type: "unstable_server_log",
        level: "info",
        data: `Dev server ready. ${styleText("dim", "Press Ctrl+C to exit.")}`,
      });

      // No need to attach key handlers, as rnx-cli handles that already.
    }
  }
}

module.exports = FiddleReporter;
