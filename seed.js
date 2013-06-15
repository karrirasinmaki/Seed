/*
This is Seed.
Front-End templater.
Seed can store any content you like; whole template, text, image or anything.

Use:
Store:
	In <script></script> tags:
	Seed.seeds.nameyouchoose = your content
	NOTE:
	Seed.name you choose is not valid,
	do not leave spaces.
		or
	As text in html:
	*+nameyouchoose*this can really <a href="index.html">be everything</a>*+*
Get:
	*nameyouhavechosen*
	NOTE:
	* name *, *name * or * name* is not valid,
	do not leave caps.

Get external file:
	*file=urltofile*
	NOTE:
	Do not leave caps.

Update and generate template:
	Seed.init();
Only update template
	Seed.update();
To just refresh chages
	Seed.refresh();
*/
var originalSource;
var source = "";
var delCharCount = 0;
var changes = false;

function delSeedMarks(v) {	
	//Delete *seed* marks from doc
	source = source.replace(v, "");
	delCharCount += v.length;
}

var Seed = {
	part: {
		num: 0,
		last: 2,
		STORE_SEEDS: 0,
		GET_SEEDS: 1,
		LOAD_FILES: 2
	},
	updater: function(method) {
		// 0 = initializing
		// 1 = full update
		// 2 = light update

		changes = false;
		var part = Seed.part;

		//Store original source
		if(!originalSource) {
			originalSource = [];
			var el = document.querySelectorAll(".seed");
			for(var i=0; i<el.length; i++) {
				originalSource[i] = el[i].innerHTML;
			}
		}

		//Restore original source for update
		if(method < 2) {
			for(var i=0; i<originalSource.length; i++) {
				var el = document.querySelectorAll(".seed")[i];
				if(method===0)
					el.innerHTML = originalSource[i];
				if(method===1) {
					if(el.className.indexOf("init") === -1)
						el.innerHTML = originalSource[i];
				}
			}
		}

		part.num = 0;
		for(part.num=0; part.num<=part.last; part.num++) { //Start part loop
		var el = document.querySelectorAll(".seed");
		delCharCount = 0;

		//Loop trouhgt every element with "seed" class
		for(var id=0; id<el.length; id++) {
			source = el[id].innerHTML;

			//Load file
			if(part.num == part.LOAD_FILES) {
				var pos = 0;
				while(pos != -1) {
					pos = source.indexOf("*file=", pos);
					if(pos == -1) break;
					pos += 6;

					var pos2 = source.indexOf("*", pos);
					var value = source.substring(pos, pos2);

					var xmlhttp = new XMLHttpRequest();
					xmlhttp.setReq
					var index = pos;
					xmlhttp.onreadystatechange = function() {
						if(xmlhttp.readyState == 4) {
							source = source.substring(0, index-6) + xmlhttp.responseText + source.substring(pos2+1);
							changes = true;
						}
					}
					xmlhttp.open("GET", value, false);
					xmlhttp.send();
				}
			}

			//Store new seed
			if(part.num == part.STORE_SEEDS) {
				var pos = 0;
				var pos2 = 0;
				var pos3 = 0;
				while(pos != -1) {console.log(pos);
					pos = source.indexOf("*+", pos);
					if(pos == -1) break;
					pos += 2;

					pos2 = source.indexOf("*", pos);
					if(pos2 == -1) break;
					pos2 += 1;

					pos3 = source.indexOf("*+*", pos2);
					if(pos3 != -1) {
						var value = source.substring(pos2, pos3);
						Seed.seeds[source.substring(pos, pos2-1)] = value;
						delSeedMarks(source.substring(pos-2, pos3+3));

						changes = true;
					}
				}
			}

			//Get seeds
			if(part.num == part.GET_SEEDS) {
				for(var key in Seed.seeds) {
					if(source.indexOf("*"+key+"*") != -1) {
						source = source.replace("*"+key+"*", Seed.seeds[key]);
						changes = true;
					}
				}
			}

			el[id].innerHTML = source;
		}

		} //End of part loop

		//Run scripts loaded with ajax
		var el = document.querySelectorAll(".seed script");
		for(var i=0; i<el.length; i++) { //Loop thru script tags in .seed elements
			if(el[i].src.length > 0) {
				var script = document.createElement("script");
				script.src = el[i].src+"?t="+ new Date().getTime();
				el[i].src = "";
				document.body.appendChild(script);
			}
		}

		if(changes)
			Seed.updater(2)
		else if(Seed.pageLoaded)
			Seed.pageLoaded();
	},
	post: function(url, params, update) {
		var xmlhttp = new XMLHttpRequest();
		xmlhttp.onreadystatechange = function() {
			if(xmlhttp.readyState == 4) {
				//POST request sent
				if(update)
					Seed.update(true); //Update whole page

				if(Seed.posted)
					Seed.posted();
			}
		};

		xmlhttp.open("POST", url, true);
		xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		xmlhttp.send(params);
	},
	init: function(){Seed.updater(0)},
	update: function(){Seed.updater(1)},
	refresh: function(){Seed.updater(2)},
	seeds: {
	}
};