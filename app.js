const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const ytdl = require('ytdl-core');
const youtubedl = require('youtube-dl');
const fs = require('fs');

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res)=>{
    res.send('Hello World!')
    // res.redirect('http://localhost:3000/'); 
})

app.get('/getytvideo/:id', async (req, res)=>{
    // console.log(req.params.id);
    const url = await `https://www.youtube.com/watch?v=${req.params.id}`
    youtubedl.getInfo(url, async (err, info) => {
        if (err) {
            console.log(err);
        }
        const AllFormates = await [];
        info.formats.map(data => {
            // console.log(data);
            if ((data.format_note !== '144p') && (data.format_note !== 'tiny') && (data.format_note !== '240p') && (data.ext === 'mp4')) {
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
            // console.log(`Video Code: ${data.acodec} || Video formate: ${data.format_note} || Video formate: ${data.format_id} || ${parseInt(data.filesize/1000000)}mb`);
            // console.log(`resolution: ${data.format_note} || audio: ${data.acodec} || Size: ${data.filesize/1000000}mb || exten: ${data.ext} || exten: ${data.format_id}`);
        })
        // console.log(info);
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

// app.get('/download/:title/:ytid/:resolution/:ext', async (req, res)=>{
app.get('/download', async (req, res)=>{
    console.log(req.query);
    // const name = await `${req.query.videoname.replace(/\?/g, "").replace(/\|/g, "").replace(/\"/g, "'").replace(/\*/g, "").replace(/\//g, "").replace(/\\/g, "").replace(/\:/g, "-").replace(/\</g, "").replace(/\>/g, "").replace(/ /g, "_")}.${req.query.formate}`;
    // console.log(name);
    const name = req.query.videoname
    req.query.formate === 'mp3' && res.contentType('audio/mp3');
    req.query.formate === 'mp4' && res.contentType('video/mp4');
    const filename = (new Date()).toISOString()
    res.setHeader('Content-Disposition', 'attachment;')
    ytdl(`http://www.youtube.com/watch?v=${req.query.id}`, { format: req.query.formate , quality: req.query.quality})
    .pipe(res)
    // try {
    //     const video = youtubedl(`http://www.youtube.com/watch?v=${req.query.id}`, [`--format=${req.query.quality}`],  { cwd: __dirname })
    //     video.pipe(res)
    // } catch (error) {
    //     console.log("tilu - ",error);
    // }
})

// ${req.params.title}

const port = process.env.PORT || 7000;
app.listen(port, ()=>{
    console.log(`server is runing on http://localhost:${port}/`);
})
