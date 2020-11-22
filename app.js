const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const ytdl = require('ytdl-core');
const youtubedl = require('youtube-dl');

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res)=>{
    res.send('Hello World!')
})

app.get('/getytvideo/:id', async (req, res)=>{
    // let info = await ytdl.getInfo(req.params.id);
    // let format = ytdl.chooseFormat(info.formats, { quality: 'highest' });
    // console.log('Format found!', format.url);
    // res.json({
    //     downloadlink: format.url
    // })
    console.log(req.params.id);
    const url = `https://www.youtube.com/watch?v=${req.params.id}`
    youtubedl.getInfo(url, (err, info) => {
        if (err) {console.log(err)}
        res.json({
            Videolink: info.url,
            title: info.title,
            formate: info.format_id,
            thumbnail: info.thumbnail,
            description: info.description
        })
    })
})

app.get('/download/:ytid/:resolution', async (req, res)=>{
    console.log(req.params.name);
    res.header('Content-Disposition', `attachment; filename= ${Date.now()}.mp4`);
    ytdl(`http://www.youtube.com/watch?v=${req.params.ytid}`,{ format: 'mp4' , quality: req.params.resolution})
    .pipe(res);
})

// ${req.params.title}

const port = 7000;
app.listen(port, ()=>{
    console.log(`server is runing on http://localhost:${port}/`);
})