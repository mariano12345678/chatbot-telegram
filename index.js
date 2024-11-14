// routes
const express = require('express')
const app = express()
const port = 5551
const https = require('https')

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.post('/:env', (req, res) => {
    const botToken = '2072740669:AAGjtS5kAhbM0XwiUMC8RGrFHu9Rbzvtglw'
    const chatIds = {
        dev: '-566658690',
        staging: '-621508001',
        prod: '-629309158',
        dr_prod: '-753262350'
    }
    const env = req.params.env
    const chatId = chatIds[env]
    console.log(req.body)
    res.send('ok');
    if (!req.body.pipeline) {
        return;
    }
    const payload = req.body.pipeline
    let text = ''
    text += `<b>${payload.group} [${payload.name}] ${payload.stage.name}</b>`
    text += `\r\n`
    text += `State: ${payload.stage.state}`
    if (payload.stage.state !== 'Building') {
        text += `\r\n`
        text += `Result: ${payload.stage.result}`
    }
    text += `\r\n`
    text += `Start: ${payload.stage['create-time']}`
    if (payload.stage.state !== 'Building') {
        text += `\r\n`
        text += `End: ${payload.stage['last-transition-time']}`
        text += `\r\n`
        text += `Approval: ${payload.stage['approval-type']} (${payload.stage['approved-by']})`
    }
    https.get(`https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatId}&text=${text}&parse_mode=html`, (resp) => {
        let data = '';

        // A chunk of data has been received.
        resp.on('data', (chunk) => {
            data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            console.log(JSON.parse(data).explanation);
        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
