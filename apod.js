'use strict';

const async    = require('async');
const download = require('download');
const moment   = require('moment');
const request  = require('superagent');
const config   = require(__dirname + '/config');


class APODCrawler {
    constructor () {
        this.baseUrl      = config.APOD.baseUrl;
        this.maxParallel  = config.APOD.maxParallel;
        this.currDate     = config.APOD.start;
        this.interval     = config.APOD.interval;
        this.requests     = [];
        this.refreshDateBuffer();
    }

    crawlParallel () {
        setInterval( () => {
            async.parallel(this.requests, (err, res) => {
                console.log(err, res);
                this.refreshDateBuffer();
            });
        }, this.interval);
    }

    refreshDateBuffer () {
        let beginDate = moment(this.currDate);
        let next;
        this.requests = [];

        for (let i = 0; i < this.maxParallel; i++) {
            next = beginDate.add(1, 'day').format('YYYY-MM-DD');
            this.requests.push(this.createRequestJob.bind(this, next));
        }

        this.currDate = moment(next).format('YYYY-MM-DD');
    }

    createRequestJob (date, callback) {
        const query = {
            api_key: config.API_KEY,
            date: date,
            hd: true
        }

        request.get(this.baseUrl)
            .query(query)
            .end((err, res) => {
                callback(err, res.body);
            });
    }

}


let apod = new APODCrawler();
apod.crawlParallel();

