var superagent = require('superagent');
var cheerio = require('cheerio');
var async = require('async');
var concurrencyCount = 0;

var topic_urls = [];
superagent.get('https://cnodejs.org/')
    .end(function (err, sres) {
	if (err) {
		return next(err);
	}
	var $ = cheerio.load(sres.text);
	$('#topic_list .topic_title').each(function (idx, element) {
	var $element = $(element);
		topic_urls.push('https://cnodejs.org'+$element.attr('href'));
	});
	console.log('get url:\n' + topic_urls);

	async.mapLimit(topic_urls,5,
		function(url,callback){
			concurrencyCount++;
			console.log(getCurTimeStr(), '现在的并发数是', concurrencyCount, '，正在抓取的是', url);
			superagent.get(url)
				.end(function (err, sres) {
				if (err) {
					return console.log(err);
				}
			  	// console.log('fetch url:' + url);
				var $ = cheerio.load(sres.text);
				var title = $('.topic_full_title').text().trim();
				var href = url;
				var author1 = $('.dark.reply_author').eq(0).text();
				var comment1 = $('.reply_content').eq(0).text();
				var person_url1 = 'https://cnodejs.org' + $('.dark.reply_author').eq(0).attr('href');
			 //<senhong.ssh.mark>:不能这样继续开新的线程
			 //因为这样新开的线程是不受最大并发数的控制的，很容易造成并发量过大引起访问失败
			 //可以用lesson4 app.js的方式，先进行第一次多线程，第一次结果全部拿到同步之后再进行第二次多线程，每次进行多线程都用async控制并发数
			 //  	superagent.get(person_url1)
				// .end(function (err, sres) {
				// 	if (err) {
				// 		return console.log(err);
				// 	}
				// 	console.log('fetch person_url1:' + person_url1);
				// 	var $ = cheerio.load(sres.text);
					var result = {
						title: title,
						href: href,
						author1: author1,
						comment1: comment1,
						// sorce: $('.user_profile .unstyled .big').eq(0).text()
					};
					//<senhong.ssh.mark>:不要写在callback后面，有可能会不执行！
					concurrencyCount--;
					//console.log(url);
					callback(null,result);
					//<senhong.ssh.mark>:第一次达到最大并发数时，不会执行后面的代码
					//console.log(url);
				// });
		});
		},function(err,results){
			console.log(getCurTimeStr(), 'length:', results.length, ', results:');
			console.log(results);
		});

	// ep.after('results',topic_urls.length,function(results){
	// 	console.log('results:');
	// 	console.log(results);
	// });

	// topic_urls.forEach(function(url){
	// 	superagent.get(url)
	// 	.end(function (err, sres) {
	// 		if (err) {
	// 			return console.log(err);
	// 		}
	// 	  	console.log('fetch url:' + url);
	// 		var $ = cheerio.load(sres.text);
	// 		var title = $('.topic_full_title').text().trim();
	// 		var href = url;
	// 		var author1 = $('.dark.reply_author').eq(0).text();
	// 		var comment1 = $('.reply_content').eq(0).text();
	// 		var person_url1 = 'https://cnodejs.org' + $('.dark.reply_author').eq(0).attr('href');
	// 	  	superagent.get(person_url1)
	// 		.end(function (err, sres) {
	// 			if (err) {
	// 				return console.log(err);
	// 			}
	// 			console.log('fetch person_url1:' + person_url1);
	// 			var $ = cheerio.load(sres.text);
	// 			var result = {
	// 				title: title,
	// 				href: href,
	// 				author1: author1,
	// 				comment1: comment1,
	// 				sorce: $('.user_profile .unstyled .big').eq(0).text()
	// 			};
	// 			ep.emit('results',result);
	// 		});
	// 	});
	// });
});

function getCurTimeStr(){
  var myDate = new Date();
  return fix(myDate.getSeconds(),2) + ":" + fix(myDate.getMilliseconds(),3) + " === ";
}
function fix(num, length) {
  return ('' + num).length < length ? ((new Array(length + 1)).join('0') + num).slice(-length) : '' + num;
}
