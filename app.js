const { App } = require("@slack/bolt");
require("dotenv").config();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Initializes your app with your bot token and signing secret
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode:true, // enable the following to
  appToken: process.env.APP_TOKEN
});

(async () => {
  const port = 3000
  // Start your app
  await app.start(process.env.PORT || port);
  console.log(`⚡️ Slack Bolt app is running on port ${port}!`);
})();

const boardId = process.env.BOARD_ID
app.command("/list", async ({ command, ack, say }) => {
  try {
    await ack();
    say("Here's item list:")
    fetch("https://api.monday.com/v2", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": process.env.MONDAY_TOKEN
      },
      body: JSON.stringify({
        query : `query { boards (ids:[`+boardId+`]) {id name items{id name}} }`
      })
    })
    .then(res => res.json())
    .then(data => {
      console.log(data.data)
      items = data.data.boards[0].items
      prefixUrl = "https://pegawaigabut.monday.com/boards/"+boardId+"/pulses/"
      for (let i = 0; i < items.length; i++) {
        say("Name: "+items[i].name+", link: "+prefixUrl+items[i].id)
      }
    })
    .catch (error => {
      console.log("err")
      console.error(error);
    });
  } catch (error) {
    console.log("err")
    console.error(error);
  }
});

app.command("/start", async ({ command, ack, say }) => {
  try {
    await ack();
    itemId = command.text
    fetch("https://api.monday.com/v2", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": process.env.MONDAY_TOKEN
      },
      body: JSON.stringify({
        query : `mutation {
          change_column_value(
            board_id: `+boardId+`,
            item_id: `+itemId+`,
            column_id: "status1",value:"{ \\"index\\":1 }"
          )
          {id}
        }`
      })
    })
    .then(res => {
      if (res.status != 200) {
        say("Oops! Something went wrong. Probably "+itemId+" is not a valid itemId.")
      } else {
        say("Start an item with Id: "+itemId)
      }
      return res.json()
    })
    .then(data => {
      console.log(data)
    })
    .catch (error => {
      console.log("err")
      console.error(error);
    });
  } catch (error) {
    console.log("err")
    console.error(error);
  }
});

app.command("/stop", async ({ command, ack, say }) => {
  try {
    await ack();
    itemId = command.text
    fetch("https://api.monday.com/v2", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": process.env.MONDAY_TOKEN
      },
      body: JSON.stringify({
        query : `mutation {
          change_column_value(
            board_id: `+boardId+`,
            item_id: `+itemId+`,
            column_id: "status1",value:"{ \\"index\\":0 }"
          )
          {id}
        }`
      })
    })
    .then(res => {
      if (res.status != 200) {
        say("Oops! Something went wrong. Probably "+itemId+" is not a valid itemId.")
      } else {
        say("Stop an item with Id: "+itemId)
      }
      return res.json()
    })
    .then(data => {
      console.log(data)
    })
    .catch (error => {
      console.log("err")
      console.error(error);
    });
  } catch (error) {
    console.log("err")
    console.error(error);
  }
});