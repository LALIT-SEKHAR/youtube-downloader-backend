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

    const url = await `https://www.youtube.com/watch?v=${req.params.id}`
    youtubedl.getInfo(url, async (err, info) => {
        if (err) {console.log(err)}
        const AllFormates = await [];
        info.formats.map(data => {
            if ((data.format_note !== '144p') && (data.format_note !== 'tiny') && (data.format_note !== '240p')) {
                AllFormates.push({
                    "resolution": data.format_note,
                    "audio": data.acodec,
                    "Size": `${parseInt(data.filesize/1000000)}mb`,
                    "exten": data.ext,
                    "format_id": data.format_id,
                    "url": data.url,
                    "height": data.height,
                })
                // console.log(`Video Code: ${data.vcodec} || Video formate: ${data.format_note}`);
            }
            // console.log(`resolution: ${data.format_note} || audio: ${data.acodec} || Size: ${data.filesize/1000000}mb || exten: ${data.ext} || exten: ${data.format_id}`);
        })
        // console.log(info.formats);
        // console.log(AllFormates);
        AllFormates.sort(function(a, b){return a.height-b.height});
        res.json({
            Videolink: info.url,
            title: info.title,
            formate: info.format_id,
            thumbnail: info.thumbnail,
            description: info.description,
            AllFormates: AllFormates
        })
    })
})

app.get('/download/:ytid/:resolution/:ext', async (req, res)=>{
    res.header('Content-Disposition', `attachment; filename= ${Date.now()}.${req.params.ext}`);
    ytdl(`http://www.youtube.com/watch?v=${req.params.ytid}`,{ format: 'mp4' , quality: req.params.resolution})
    .pipe(res)
})

// ${req.params.title}

const port = process.env.PORT || 7000;
app.listen(port, ()=>{
    console.log(`server is runing on http://localhost:${port}/`);
})