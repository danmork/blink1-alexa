"use strict";

const Alexa = require("alexa-sdk");
const AWS = require("aws-sdk");
const colors = require("color-name");
const s3 = new AWS.S3();
const bucket = "com.humanstuff.blink1";
const key = "color.json";

function setColor(colorName, callback) {
  var body = JSON.stringify({ color: colorName });
  var params = { Bucket: bucket, Key: key, Body: body };
  s3.putObject(params, function (err, result) {
    if (err) console.log("Error writing to S3:", err);
    callback(err, result);
  });
}

var handlers = {};

handlers.LaunchRequest = function () {
  var reprompt = "You can say: turn on, turn off, or change the color to the name of a color.";
  var prompt = "Blink one is ready. " + reprompt;
  this.emit(":tell", prompt, reprompt);
};

handlers.TurnOnIntent = function () {
  var self = this;
  setColor("white", function (err) {
    if (err) {
      self.emit(":tell", "Sorry. Something went wrong. I was not able to turn on the Blink One light.");
    }
    else {
      self.emit(":tell", "Turning on the Blink One light.");
    }
  });
};

handlers.TurnOffIntent = function () {
  var self = this;
  setColor("black", function (err) {
    if (err) {
      self.emit(":tell", "Sorry. Something went wrong. I was not able to turn off the Blink One light.");
    }
    else {
      self.emit(":tell", "Turning off the Blink One light.");
    }
  });
};

handlers.SetColorIntent = function () {
  var self = this;
  var color = this.event.request.intent.slots.color;
  var colorName = color && color.value.replace(" ", "") || null;
  
  if (!colorName) {
    self.emit(":tell", "I didn't hear the name of a color. Please try again.");
  } else if (!colors[colorName]) {
    self.emit(":tell", "Sorry, I don't know a color by that name. Please try again.");
  } else {
    setColor(colorName, function (err) {
      if (err) {
        self.emit(":tell", "Sorry. Something went wrong. I was not able to change the color to " + color.value);
      }
      else {
        self.emit(":tell", "Changing the color to " + color.value);
      }
    });
  }
};

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.registerHandlers(handlers);
    alexa.execute();
};
