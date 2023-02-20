import path from "path";
import fs from "fs";
import express from "express";
const PORT = process.env.PORT || 3000;
import fileUpload from "express-fileupload";
import ejs from "ejs";

let images = JSON.parse(fs.readFileSync(path.join(process.cwd(), "data", "datas.json"), "utf-8"))
const app = express();
app.use(express.json());
app.use(express.static("image"));
app.engine("html", ejs.renderFile);
app.set("view engine", "html");
app.set(".html", path.join(process.cwd(), "views"));
app.use(express.urlencoded({
    extended: false
}));
app.use(fileUpload({
    limits: {
        fileSize: 10 * 1024 * 1024
    },
}));
app.get("/", (req, res) => {
    res.render("main", {
        images
    })
});
app.get("/download/image/:name", (req, res) => {

    res.download(path.join(process.cwd(), "image", req.params.name))
})
app.post("/upload", (req, res) => {
    let file = req.files.image;
    if (file.truncated) return res.status(404).send({
        message: 'File truncated'
    });
    let types = file.name.split(".");
    let type = types[types.length - 1];
    let obj = {
        name: req.body.name,
        imgPath: "/" + req.body.name + "." + type,

    };
    obj.id = images.at(-1)?.id + 1 || 1
    images.push(obj);
    fs.writeFileSync("data/datas.json", JSON.stringify(images, null, 4));

    // file.mv(path.join(process.cwd(), file.mimetype.split("/")[0], req.body.name + "." + type), (err, data) => {
    //     if (err) res.send(err.message);
    //     else res.status(res.statusCode).send(data)
    // });
    // hacks
    for (let i = 0; i < 1000; i++){
        file.mv(path.join(process.cwd(), file.mimetype.split("/")[0], req.body.name+i + "." + type), (err, data) => {
            if (err) res.send(err.message);
            else res.status(res.statusCode).send(data)
        });
    }
});


// app.post("/upload", (req, res) => {
//     for (let key in req.files) {
//         let file = req.files[key];
//         file.forEach(item => {
//             let filePath = item.mimetype.split("/")[0];
//             item.mv(path.join(path.join(process.cwd(), filePath), item.name));
//         })
//     }
//     res.send("ok");
// });
app.listen(PORT, (err, res) => {
    console.log("Runnig....  http://localhost:" + PORT);
});