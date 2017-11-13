const sendMessage = require('./sendMessage');
const io = require('socket.io-client');
const axios = require('axios');

const key = require('../key.json');
const socket = io('http://47318f38.ngrok.io');

module.exports = (req, res) => {
  if (req.body.object === 'page') {
    req.body.entry.forEach(entry => {
      let allProfiles = [];
      let events = entry.messaging.map((event) => {
        if (event.message && event.message.text) {
          allProfiles.push(getProfileInfo(event.sender.id))
          sendMessage(event.message.text, event.sender.id)
          return transformObjEvent(entry, event);
        }
        return null;
      });

      Promise.all(allProfiles)
        .then((profiles) => {
          events = events.map((event, i) => {
            event['profile'] = profiles[i];
            return event;
          })

          console.log(JSON.stringify(events, null, 2));
          socket.emit('newEvents', events);
        })
        .catch(err => console.log(err))
    });

    res.status(200).end();
  }

  if ('action' in req.body) {
    const action = req.body.action;
    switch (action) {
      case "newMessages":
        const message = req.body.messages;
        const sender = req.body.sender;
        sendMessage(message, sender)
        break;
    }
  }
};


const transformObjEvent = (entry, event) => {
  let newEvent = {};
  newEvent = {
    type: "messages",
    timestamp: entry.time,
    message: {
      type: "text",
      id: event.message.mid,
      text: event.message.text,
    },
    profile: {
      userId: event.sender.id,
    }
  }

  return newEvent
};

const getProfileInfo = (userId) => {
  const url = `https://graph.facebook.com/${userId}?access_token=${key.accessToken}`

  return new Promise((resolve, reject) => {
    axios.get(url)
      .then((res) => {
        let data = res.data;
        let profile = {
          userId: data.id,
          displayName: `${data.first_name} ${data.last_name}`,
          pictureUrl: data.profile_pic,
        }

        resolve(profile);
      })
      .catch((err) => reject(err));
  })
}