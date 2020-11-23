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

app.get('/getytvideo/:id', (req, res)=>{
    // let info = await ytdl.getInfo(req.params.id);
    // let format = ytdl.chooseFormat(info.formats, { quality: 'highest' });
    // console.log('Format found!', format.url);
    // res.json({
    //     downloadlink: format.url
    // })
    // console.log(req.params.id);
    const url = `https://www.youtube.com/watch?v=${req.params.id}`
    youtubedl.getInfo(url, (err, info) => {
        if (err) {console.log(err)}
        res.json({
            Videolink: info.url || 'https://r2---sn-gwpa-ccpd.googlevideo.com/videoplayback?expire=1606123277&ei=rSq7X8mtJYiUvQS1toHYBg&ip=2409%3A4062%3A2e8e%3Afc51%3A3839%3A2333%3Aac50%3Aa6c8&id=o-AEivPWotY0c59qvVCsmY6SVQSJ_BjOaSLZLfmHcFPMoZ&itag=22&source=youtube&requiressl=yes&mh=Ut&mm=31%2C29&mn=sn-gwpa-ccpd%2Csn-cvh76nek&ms=au%2Crdu&mv=m&mvi=2&pcm2cms=yes&pl=41&gcr=in&initcwndbps=196250&vprv=1&mime=video%2Fmp4&ns=BDSPbzJTzwRAHsJ0iTqu878F&ratebypass=yes&dur=48.065&lmt=1605973615624921&mt=1606101391&fvip=2&beids=9466588&c=WEB&txp=5532434&n=QaQBmA59saq5dEL&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cgcr%2Cvprv%2Cmime%2Cns%2Cratebypass%2Cdur%2Clmt&sig=AOq0QJ8wRAIgXTybaR_fl73fISG3QEIvWLznjNNmtL5PEYRmJHfu3ngCICBORQrOIGB-SmLgd1XxhSMCAbLfJLp9AX6L2PAu5z-i&lsparams=mh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpcm2cms%2Cpl%2Cinitcwndbps&lsig=AG3C_xAwRQIgLwlxOzLHi-dsFiiQzmkicNFw8WGeXSZdvRUBDoMMdTkCIQCJzj4BM0gydLQ9lUaVP8oNh-Fwb3BgqTtmxbW19rJ5_Q%3D%3D',
            title: info.title || 'The Title Track Is As Groovy As The Whole Series | SCAM 1992 - The Harshad Mehta Story',
            formate: info.format_id || '22',
            thumbnail: info.thumbnail || 'https://i.ytimg.com/vi/p3OUFMpT7B0/hqdefault.jpg?sqp=-oaymwEYCKgBEF5IVfKriqkDCwgBFQAAiEIYAXAB&rs=AOn4CLDrn5n946PhgsZAZTdz6df0gq-NPQ',
            description: info.description || 'fsdhgsdhdgc rh sdfh dh zdedyuejryi rkrj drjerje',
        })
        // console.log(info);
    })
})

app.get('/download/:ytid/:resolution', async (req, res)=>{
    console.log(req.params.name);
    res.header('Content-Disposition', `attachment; filename= ${Date.now()}.mp4`);
    ytdl(`http://www.youtube.com/watch?v=${req.params.ytid}`,{ format: 'mp4' , quality: req.params.resolution})
    .pipe(res)
})

// ${req.params.title}

const port = process.env.PORT || 7000;
app.listen(port, ()=>{
    console.log(`server is runing on http://localhost:${port}/`);
})