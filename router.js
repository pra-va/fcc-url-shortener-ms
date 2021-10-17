const express = require("express");
const router = express.Router();
const {model} = require("mongoose");
const dns = require("dns");
require("./models");

const UrlModel = model("URL");


router
    .get("/hello", (req, res) => {
        res.json({
            hello: "world"
        });
    })
    .post("/shorturl", (req, res) => {
        const url = req.body.url;
        if (isValidUrl(url)) {
            dns.lookup(trimUrl(url), (err, address, family) => {
                if (err) {
                    return returnError(res);
                }
                UrlModel.findOne({url}, (err, foundUrl) => {
                    if (err) console.error(err);
                    if (foundUrl) {
                        res.json({
                            original_url: foundUrl.url,
                            short_url: foundUrl.shortenedUrl
                        })
                    } else {
                        UrlModel
                            .findOne()
                            .sort("-shortenedUrl")
                            .exec((err, lastUrl) => {
                                if (err) console.error(err);
                                const newUrl = new UrlModel({
                                    url,
                                    shortenedUrl: ++lastUrl.shortenedUrl
                                });
                                newUrl.save((err, savedUrl) => {
                                    if (err) console.error(err);
                                    res.json({
                                        original_url: savedUrl.url,
                                        short_url: savedUrl.shortenedUrl
                                    });
                                });
                            });
                    }
                });
            })
        } else {
           returnError(res);
        }
    })
    .get("/shorturl/:shortLink", (req, res) => {
        UrlModel.findOne({shortenedUrl: req.params.shortLink}, (err, urlDocument) => {
            if (err) console.error(err);
            if (!urlDocument) {
                res.json({
                    error: "invalid short url"
                })
            }
            res.redirect(urlDocument.url);
        });
    });

const returnError = res => {
    res.json({
       error: "invalid url"
    });
}

const trimUrl = url => {
    return url
        .replace("http://", "")
        .replace("https://", "")
        .split("/")[0];
}

const isValidUrl = url => {
    const containsProtocol = url.includes("http://") || url.includes("https://");
    const containsWww = url.includes("www.");
    const containsDots = (url.match(/\./g) || []).length > 1;
    const containsNoTrailingDots = !url.includes("..");

    return containsProtocol && containsWww && containsDots && containsNoTrailingDots;
}

module.exports = router;