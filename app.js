const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const ytdl = require('ytdl-core');
const youtubedl = require('youtube-dl');
const fs = require('fs')
const { exec } = require('child_process')
const path = require('path')

// var dir = 'public';
// var subDirectory = 'public/uploads';
// if (!fs.existsSync(dir)){
//     fs.mkdirSync(dir);
//     fs.mkdirSync(subDirectory)
// }

app.use(cors());
app.use(bodyParser.json());
// app.use(express.static('public'))


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
    // const name = await `${req.query.videoname.replace(/\?/g, "").replace(/\|/g, "").replace(/\"/g, "'").replace(/\*/g, "").replace(/\//g, "").replace(/\\/g, "").replace(/\:/g, "-").replace(/\</g, "").replace(/\>/g, "").replace(/ /g, "_")}`;
    // console.log(name);
    const name = req.query.name
    req.query.formate === 'mp3' && res.contentType('audio/mp3');
    req.query.formate === 'mp4' && res.contentType('video/mp4');
    res.setHeader('Content-Disposition', 'attachment;')
    const RawVideoPath = path.join(__dirname, 'public', 'uploads', "input.mp4")
    const HighVideoPath = path.join(__dirname, 'public', 'uploads', "Highinput.mp4")
    const outmp3Path = path.join(__dirname, 'public', 'uploads', "output.mp3")
    const inmp3Path = path.join(__dirname, 'public', 'uploads', "input.mp3")
    const outmp4Path = path.join(__dirname, 'public', 'uploads', "output.mp4")
    fs.existsSync(RawVideoPath) && fs.unlinkSync(RawVideoPath);
    fs.existsSync(HighVideoPath) && fs.unlinkSync(HighVideoPath);
    fs.existsSync(outmp3Path) && fs.unlinkSync(outmp3Path);
    fs.existsSync(inmp3Path) && fs.unlinkSync(inmp3Path);
    fs.existsSync(outmp4Path) && fs.unlinkSync(outmp4Path);
    const CWSoflowVideo = fs.createWriteStream(RawVideoPath)
    const CWSofhighVideo = fs.createWriteStream(HighVideoPath)
    // for mp3
    if (req.query.formate === 'mp3') {
        ytdl(`http://www.youtube.com/watch?v=${req.query.id}`, { format: 'mp4' , quality: 'highestaudio'})
        .pipe(CWSoflowVideo)
        CWSoflowVideo.on('close', function () {
                exec(`ffmpeg -i ${RawVideoPath} ${outmp3Path}`, (error, stdout, stderr) => {
                    if (error) {
                        console.log("error : "+error);
                    }else{
                        var readStream = fs.createReadStream(outmp3Path);
                        readStream.on('open', function () {
                            console.log("open");
                            readStream.pipe(res);
                        });
                        readStream.on('close', function () {
                            console.log("closed");
                            fs.unlinkSync(RawVideoPath);
                            fs.unlinkSync(outmp3Path);
                        });
                    }
                })
        });
    }
    //for mp4
    if (req.query.formate === 'mp4') {
        console.log('downloading low video');
        ytdl(`http://www.youtube.com/watch?v=${req.query.id}`, { format: 'mp4' , quality: 'highestaudio'})
        .pipe(CWSoflowVideo)
        CWSoflowVideo.on('close', function () {
            console.log('extracting audio from video');
            exec(`ffmpeg -i ${RawVideoPath} ${outmp3Path}`, (error, stdout, stderr) => {
                if (error) {
                    console.log("error : "+error);
                }else{
                    // var readStream = fs.createReadStream(outmp3Path);
                    // readStream.on('close', function () {
                        console.log("closed");
                        console.log('deleting low video');
                        fs.unlinkSync(RawVideoPath);
                        console.log('downloading high video');
                        ytdl(`http://www.youtube.com/watch?v=${req.query.id}`, { format: 'mp4' , quality: req.query.quality})
                        .pipe(CWSofhighVideo)
                        CWSofhighVideo.on('close', function () {
                            console.log('merging high video and audio');
                            exec(`ffmpeg -i ${HighVideoPath} -i ${outmp3Path} -map 0:v -map 1:a -c:v copy -c:a copy ${outmp4Path} -y`, (error, stdout, stderr) => {
                                if (stderr) {
                                    console.log("deleting output audio and video");
                                    var readStream = fs.createReadStream(outmp4Path);
                                    readStream.on('open', function () {
                                        console.log("open");
                                        readStream.pipe(res);
                                    });
                                    readStream.on('close', function () {
                                        console.log("* All Done *");
                                        fs.unlinkSync(HighVideoPath);
                                        fs.unlinkSync(outmp4Path);
                                        fs.unlinkSync(outmp3Path);
                                    });
                                }
                            })
                        })
                    // });
                }
            })
        });
    }
})

// ${req.params.title}

const port = process.env.PORT || 7000;
app.listen(port, ()=>{
    console.log(`server is runing on http://localhost:${port}/`);
})
