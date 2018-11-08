/*
 * View model for OctoPrint-MeshAdjust
 *
 * Author: Harold Oudshoorn
 * License: AGPLv3
 */
$(function() {
  function MeshAdjustViewModel(parameters) {
    var self = this;

    self.settings = parameters[0]
    self.loginState = parameters[1]

    self.bedWidth = ko.observable("200.00")
    self.bedDepth = ko.observable("200.00")
    self.edgeOffset = ko.observable("15.00")
    self.feedrate = ko.observable("1000")
    self.isOperational = ko.observable(undefined);
    self.isPrinting = ko.observable(undefined);

    self.testPrint = function(wMult, dMult) {
      wEffective = self.bedWidth() - 2* self.edgeOffset()
      dEffective = self.bedDepth() - 2* self.edgeOffset()
      xPos = 1.0*self.edgeOffset() + (wMult*wEffective);
      yPos = 1.0*self.edgeOffset() + (dMult*dEffective);
      code = "G0";
      code += " X" + xPos;
      code += " Y" + yPos;
      code += " F" + self.feedrate();
      //OctoPrint.control.sendGcode(code);
      console.log("TouchTest: Sending command \"" + code +"\"");
    }

    self.adjustMesh = function(xIndex, yIndex, value) {
      code = "M421";
      code += " I" + xIndex;
      code += " J" + yIndex;
      code += " Q" + value;
      OctoPrint.control.sendGcode(code);
      console.log("MeshAdjust: Sending command \"" + code +"\"");
    }

    self.onBeforeBinding = function() {
      self.feedrate(self.settings.settings.plugins.meshadjust.feedrate());
    }

    self.fromCurrentData = function(data) {
      self._processStateData(data.state);
    };

    self.fromHistoryData = function(data) {
      self._processStateData(data.state);
    };

    self._processStateData = function(data) {
      self.isOperational(data.flags.operational);
      self.isPrinting(data.flags.printing);
    };

    self.movementEnabled = function() {
      return (self.isOperational() && self.loginState.isUser() && ! self.isPrinting());
    }
  }

  // view model class, parameters for constructor, container to bind to
  OCTOPRINT_VIEWMODELS.push([
    MeshAdjustViewModel,
    [ "settingsViewModel", "loginStateViewModel" ],
    [ "#sidebar_plugin_meshadjust" ]
  ]);
});
