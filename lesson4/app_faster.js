var superagent = require('superagent');
var cheerio = require('cheerio');
var eventproxy = require('eventproxy');

var ep = new eventproxy();

var all_topic_urls = [];
superagent.get('https://cnodejs.org/')
    .end(function (err, sres) {
	if (err) {
		return next(err);
	}
	var $ = cheerio.load(sres.text);
	$('#topic_list .topic_title').each(function (idx, element) {
	var $element = $(element);
		all_topic_urls.push('https://cnodejs.org'+$element.attr('href'));
	});
	console.log('get url:\n' + all_topic_urls);

	var topic_urls = [all_topic_urls[0],all_topic_urls[1],all_topic_urls[2],all_topic_urls[3],all_topic_urls[4]];

	ep.after('results',topic_urls.length,function(results){
		console.log('results:');
		console.log(results);
	});

	topic_urls.forEach(function(url){
		superagent.get(url)
		.end(function (err, sres) {
			if (err) {
				return console.log(err);
			}
		  	console.log('fetch url:' + url);
			var $ = cheerio.load(sres.text);
			var title = $('.topic_full_title').text().trim();
			var href = url;
			var author1 = $('.dark.reply_author').eq(0).text();
			var comment1 = $('.reply_content').eq(0).text();
			var person_url1 = 'https://cnodejs.org' + $('.dark.reply_author').eq(0).attr('href');
		  	superagent.get(person_url1)
			.end(function (err, sres) {
				if (err) {
					return console.log(err);
				}
				console.log('fetch person_url1:' + person_url1);
				var $ = cheerio.load(sres.text);
				var result = {
					title: title,
					href: href,
					author1: author1,
					comment1: comment1,
					sorce: $('.user_profile .unstyled .big').eq(0).text()
				};
				ep.emit('results',result);
			});
		});
	});
});
