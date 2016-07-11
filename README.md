# colorbot: a slack-connected poll-bot that connects colors and emojis

As humans, we have a lot of associations with different colors, particularly as it pertains to emotion.

One way we've been exploring this in the Open Lab is through a hookup between BuzzFeed's [Slack](https://slack.com/) channels and the big screen TV in the San Francisco news room.

`colorbot`, as we call him, waits for someone in Slack to use an emoji in a sentence. Then he asks what color to associate with that emoji.

From then on, whenever someone uses that emoji, colorbot responds with the associated color and also displays it on the big screen TV. Colorbot also records the color association info using MongoDB.

### How do I build my own colorbot?

You'll need a hosted Mongo database of some kind (I used [mlab](https://mlab.com/)), a [Slack](https://slack.com/) account, and a server like AWS for hosting the color-displaying webpage. You can hook all of them together using HTTP requests and [hook.io](https://hook.io/).

You can upload the color-emoji.json file into your MongoDB collection. You can then use the code in the `hook.io` folder to pass webhooks you set up in Slack to your database and to the `colorpage` on your server.

### How do I build a cool Slack-controlled color lamp?

You can build an internet connected lamp from a Particle Internet button using the code in the `colorlamp` folder and the `colorlamp-hook.js` hook in the `hook.io` folder.

Have fun!