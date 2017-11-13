const axios = require('axios');
const key = require("../key.json");

module.exports = (message, sender) => {
  const url = `https://graph.facebook.com/v2.6/me/messages?access_token=${key.accessToken}`

  const data = {
    recipient: { id: sender },
    message: {
      "text": message,
    },
  }

  axios.post(url, data, {
    headers: {
      "Content-Type": "application/json",
    }
  })
    .then()
    .catch((err) => console.log(err));
};
