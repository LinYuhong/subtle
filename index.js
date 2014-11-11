var util    = require('util')
var fs      = require('fs')
var path    = require('path')
var url     = require('url')

var request = require('request')
var cheerio = require('cheerio')
var async   = require('async')
var _       = require('lodash')
var moment  = require('moment')

var dirname = moment().format('YYYYMMDDHHmmss')
var orient = 'http://subtlepatterns.com/page/'
var page = 0
var total = 40

fs.mkdirSync(dirname)
console.log('mkdir: %s', dirname)

async.whilst(
  function () { return page < total },
  function (done) {
    request(orient+page, function(err, response, body) {
      if(err) return done(err)
      if(response.statusCode !== 200) return done()

      var $ = cheerio.load(body)

      async.each(
        $('.rssthumb img')
          .map(function(i, $img) {
            return $(this).attr('src')
          }).get(),
        function(src, callback) {
          request({
            encoding: null,
            uri: url.resolve('http://subtlepatterns.com/', src)
          }, function(err, response, body) {
            if(err) return callback(err)
            if(response.statusCode !== 200) return callback()

            var directory = path.resolve(dirname, path.basename(src))

            fs.writeFile(directory, body, 'binary', function(err) {
              if(err) return callback(err)
              util.log(directory)
              callback()
            })
          })
        },
        function(err) {
          if(err) return done(err)
          done()
        }
      )
    })

    page ++
  },
  function (err) {
    if(err) return util.error(err)
    console.log('DONE!')
  }
)