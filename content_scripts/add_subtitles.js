(function(){

if(window.has_run){
    var option_div = document.getElementById("option__");
    option_div.style.display = option_div.style.display == "none" ? "inline-block" : "none";
    return;
}
else{
    if(document.getElementById("option__") != undefined){
        document.getElementById("option__").outerHTML = "";
        document.getElementById("subtitle__").outerHTML = "";
    }
}
window.has_run = true;

console.log(this.document.body);

var sub_element = document.createElement("div");
sub_element.id = "subtitle__";
document.body.append(sub_element);

var menu = document.createElement("div");
menu.id = "option__";
menu.innerHTML = `
<p style="margin-top: 0px;">
    <button id="refresh_video_list">Refresh</button>
</p>
<p id="video_elements_list">
</p>
<p>
    Subtitles file: <input type="file" accept=".srt" id="subtitle_file_input">
</p>
<p>
    Offset: <input type="number" step="0.01" id="subtitle_offset_input"> seconds
</p>
<p>
    Position offset: <input type="number" id="subtitle_position_input"> seconds
</p>
<p>
    Subtitles style:<br>
    <textarea id="subtitle_style_input"></textarea>
</p>
`;
document.body.append(menu);

var style = document.createElement("style");
style.type = "text/css";
style.innerHTML = `
#option__{
    color: black !important;
    font-size: inherit;
    background-color: white !important;
    display: inline-block;
    z-index: 99999999 !important;
    position: fixed !important;
    right: 14px !important;
    bottom: 14px !important;
    width: 430px !important;
    border: 1px solid black !important;
    padding-left: 14px !important;
    padding-right: 16px !important;
    padding-top: 12px !important;
}
#option__ input{
    display: inline !important;
    background-color: white !important;
    padding: initial !important;
    margin: initial !important;
}
#option__ input:not([type="file"]){
    height: 20px !important;
}
#option__ input:not([type="file"]), #option__ textarea{
    border: 1px solid black !important;
    box-sizing: border-box !important;
    margin: initial !important;
    padding: initial !important;
}
#option__ *{
    font-family: monospace !important;
    font-size: 12px !important;
}
#option__ p{
    margin-top: 12px;
    margin-bottom: 12px;
}
#subtitle_style_input{
    width: 100% !important;
    min-height: 100px !important;
}
#video_elements_list{
    margin-top: 0px !important;
}
#video_elements_list div{
    margin-top: 0px !important;
    border: 1px solid black;
    margin-top: -1px !important;
    padding: 3px !important;
    cursor: pointer !important;
}
.selected_video_list{
    border: 2px solid red !important;
}
.hover_video_list{
    border: 2px solid red !important;
}
.hover_video_element{
    border: 4px solid red !important;
}
`;
document.getElementsByTagName("head")[0].appendChild(style);

var video_elements = document.getElementsByTagName("video");
var video_element;
var video_elements_list = document.getElementById("video_elements_list");

function do_video_elements_list(){
    video_elements_list.innerHTML = "";
    for(var i = 0; i < video_elements.length; i++){
        var v = document.createElement("div");
        v.className = "video_el";
        v.innerHTML += "id: "+video_elements[i].id;
        (function(){
            var video_el = video_elements[i];
            v.addEventListener("mouseenter", function(){
                this.classList.add("hover_video_list");
                video_el.classList.add("hover_video_element");
            });
            v.addEventListener("mouseleave", function(){
                this.classList.remove("hover_video_list");
                video_el.classList.remove("hover_video_element");
            });
            v.addEventListener("click", function(){
                if(video_element == video_el){
                    video_element = undefined;
                    var list = document.getElementsByClassName("video_el");
                    for(var i = 0; i < list.length; i++){
                        list[i].classList.remove("selected_video_list");
                    }
                    subtitle_element.innerHTML = "";
                }
                else{
                    video_element = video_el;
                    var list = document.getElementsByClassName("video_el");
                    for(var i = 0; i < list.length; i++){
                        list[i].classList.remove("selected_video_list");
                    }
                    this.classList.add("selected_video_list");
                    subtitle_pos();
                }
            });
        }());
        video_elements_list.append(v);
    }
}

do_video_elements_list();
document.getElementById("refresh_video_list").addEventListener("click", function(){
    do_video_elements_list();
    subtitle_pos();
});

var subtitle_element = document.getElementById("subtitle__");
var default_style = `font-family: sans-serif;
font-size: 26px;
color: white;
text-shadow: 0px 0px 3px black;
text-align: center;
pointer-events: none;`;
document.getElementById("subtitle_style_input").value = default_style;
subtitle_element.style = default_style;
document.getElementById("subtitle_offset_input").value = 0;
document.getElementById("subtitle_position_input").value = -50;
var subtitle_offset = parseFloat(document.getElementById("subtitle_offset_input").value);
var subtitle_position = parseFloat(document.getElementById("subtitle_position_input").value);

var subtitles = [];

setInterval(function(){
    if(subtitles.length == 0) return;
    var t = video_element.currentTime;
    var found = -1;
    for(var i = 0; i < subtitles.length; i++){
        if(subtitles[i].begin+subtitle_offset <= t && subtitles[i].end+subtitle_offset >= t){
            found = i;
            break;
        }
    }
    if(found == -1){
        subtitle_element.innerHTML = "";
    }
    else{
        subtitle_element.innerHTML = subtitles[found].text;
    }
}, 100);

function get_offset(e){
    var top = 0;
    var left = 0;
    do {
        top += e.offsetTop || 0;
        left += e.offsetLeft || 0;
        e = e.offsetParent;
    } while(e);
    return [top, left];
}

function subtitle_pos(){
    var sub_pos_top = video_element.offsetHeight+get_offset(video_element)[0]+subtitle_position;
    var sub_pos_left = get_offset(video_element)[1];
    subtitle_element.style.position = "absolute";
    subtitle_element.style.width = video_element.offsetWidth+"px";
    subtitle_element.style.top = sub_pos_top+"px";
    subtitle_element.style.left = sub_pos_left+"px";
}

function time_parse(t){
    var split = t.split(":")
    var hours = split[0]*60*60;
    var minutes = split[1]*60;
    var seconds = parseFloat(t.split(":")[2].replace(',', '.'));
    return hours+minutes+seconds;
}

function parse_subtitles(subs){
    subs = subs.replace(/\r/g, "");
    subs = subs.split("\n\n");

    for(var i = 0; i < subs.length; i++){
        s = subs[i].split("\n");
        time = s[1].split(" --> ");
        text = [];
        for(var j = 2; j < s.length; j++){
            text.push(s[j]);
        }
        subtitles.push({begin: time_parse(time[0]), end: time_parse(time[1]), text: text.join("<br>")});
    }
}

document.getElementById("subtitle_file_input").addEventListener("change", function(){
    var subtitle_file = this.files[0];
    var file_reader = new FileReader();
    file_reader.onload = (function(reader){
        return function(){
            parse_subtitles(reader.result);
        }
    })(file_reader);
    file_reader.readAsText(subtitle_file);
    subtitle_pos();
});

document.getElementById("subtitle_offset_input").addEventListener("change", function(){
    subtitle_offset = parseFloat(document.getElementById("subtitle_offset_input").value);
});

document.getElementById("subtitle_position_input").addEventListener("change", function(){
    subtitle_position = parseFloat(document.getElementById("subtitle_position_input").value);
    subtitle_pos();
});

document.getElementById("subtitle_style_input").addEventListener("change", function(){
    subtitle_element.style = document.getElementById("subtitle_style_input").value;
    subtitle_pos();
});
})();