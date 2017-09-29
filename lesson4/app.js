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

	ep.after('topic_urls',topic_urls.length,function(pairs){
		topic_map = [];
		pairs.forEach(function(pair){
			var url = pair[0];
			var htmltxt = pair[1];
		  	var $ = cheerio.load(htmltxt);
		  	var person_url = 'https://cnodejs.org' + $('.dark.reply_author').eq(0).attr('href');
		  	topic_map.push({
		  		title: $('.topic_full_title').text().trim(),
		  		href: url,
		  		author1: $('.dark.reply_author').eq(0).text(),
		  		comment1: $('.reply_content').eq(0).text(),
		  		person_url1: person_url
		  	});
		});
		console.log('topic_map:');
		console.log(topic_map);
		ep.after('person_urls',topic_map.length,function(results){
			console.log('results:');
			console.log(results);
		});
		topic_map.forEach(function(map){
			superagent.get(map.person_url1)
			.end(function (err, sres) {
			  if (err) {
			    return console.log(err);
			  }
			  console.log('fetch person_url1:' + map.person_url1);
			  var $ = cheerio.load(sres.text);
			  var result = {
			  	title: map.title,
			  	href: map.href,
			  	author1: map.author1,
			  	comment1: map.comment1,
			  	sorce: $('.user_profile .unstyled .big').eq(0).text()
			  };
			  ep.emit('person_urls',result);
			});
		});
	});

	topic_urls.forEach(function(url){
		superagent.get(url)
		.end(function (err, sres) {
		  if (err) {
		    return console.log(err);
		  }
		  console.log('fetch url:' + url);
		  ep.emit('topic_urls',[url,sres.text]);
		});
	});
});
