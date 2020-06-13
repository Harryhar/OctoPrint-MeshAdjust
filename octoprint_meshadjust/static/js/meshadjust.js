/*
 * View model for OctoPrint-MeshAdjust
 *
 * Author: Harold Oudshoorn
 * License: AGPLv3
 */
$(function () {
  function MeshAdjustViewModel(parameters) {
    var self = this;

    self.currentX = 0;
    self.currentY = 0;

    self.code = "";

    self.settings = parameters[0];
    self.loginState = parameters[1];

    self.bedWidth = ko.observable("200.00");
    self.bedDepth = ko.observable("200.00");
    self.edgeOffset = ko.observable("15.00");
    self.feedrate = ko.observable("1000");
    self.isOperational = ko.observable(undefined);
    self.isPrinting = ko.observable(undefined);

    self.adjustMeshPoint = function (zAdjust) {
      self.code = "G1 Z" + zAdjust;
      OctoPrint.control.sendGcode("G91");
      OctoPrint.control.sendGcode(self.code);
      OctoPrint.control.sendGcode("G90");
      console.log("MeshAdjust: Sending command \"" + self.code + "\"");

      self.code = "M421 I" + self.currentX + " J" + self.currentY + " Q" + zAdjust;
      OctoPrint.control.sendGcode(self.code);
      console.log("MeshAdjust: Sending command \"" + self.code + "\"");
    }

    self.gotoMeshPoint = function (xIndex, yIndex) {
      self.currentX = xIndex;
      self.currentY = yIndex;
      self.code = "G42 I" + xIndex + " J" + yIndex + " F4000";
      OctoPrint.control.sendGcode("G1 Z5 F1000");
      OctoPrint.control.sendGcode(self.code);
      OctoPrint.control.sendGcode("G1 Z0.10 F1000");
      console.log("MeshAdjust: Sending command \"" + self.code + "\"");
    }

    self.onBeforeBinding = function () {
      self.feedrate(self.settings.settings.plugins.meshadjust.feedrate());
    }

    self.fromCurrentData = function (data) {
      self._processStateData(data.state);
    };

    self.fromHistoryData = function (data) {
      self._processStateData(data.state);
    };

    self._processStateData = function (data) {
      self.isOperational(data.flags.operational);
      self.isPrinting(data.flags.printing);
    };

    self.movementEnabled = function () {
      return (self.isOperational() && self.loginState.isUser() && !self.isPrinting());
    }
  }

  // view model class, parameters for constructor, container to bind to
  OCTOPRINT_VIEWMODELS.push([
    MeshAdjustViewModel,
    ["settingsViewModel", "loginStateViewModel"],
    ["#sidebar_plugin_meshadjust"]
  ]);
});
