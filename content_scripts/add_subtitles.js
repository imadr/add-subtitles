(function(){

if(window.has_run){
    var menu = document.getElementById("addsubtitle_menu");
    menu.style.display = menu.style.display == "none" ? "inline-block" : "none";
    return;
}
else{
    if(document.getElementById("addsubtitle_menu") != null){
        document.getElementById("addsubtitle_menu").outerHTML = "";
        document.getElementById("subtitle_element").outerHTML = "";
    }
}
window.has_run = true;

var subtitle_element = document.createElement("div");
subtitle_element.id = "subtitle_element";
document.body.append(subtitle_element);

var video_fullscreen = false;

var menu = document.createElement("div");
menu.id = "addsubtitle_menu";
menu.innerHTML = `
<p style="margin-top: 0px;">
    List of video elements:
    <button id="refresh_video_list">Refresh</button>
</p>
<p id="video_elements_list">
</p>
<button id="make_video_fullscreen" disabled="">Make video fullscreen</button>
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
#addsubtitle_menu{
    color: black !important;
    font-size: inherit;
    background-color: white !important;
    display: inline-block;
    z-index: 100000 !important;
    position: fixed !important;
    right: 14px !important;
    bottom: 14px !important;
    width: 430px !important;
    border: 1px solid black !important;
    padding-left: 14px !important;
    padding-right: 16px !important;
    padding-top: 12px !important;
}
#addsubtitle_menu input{
    display: inline !important;
    background-color: white !important;
    padding: initial !important;
    margin: initial !important;
    width: initial !important;
}
#addsubtitle_menu input:not([type="file"]){
    height: 20px !important;
}
#addsubtitle_menu input:not([type="file"]), #addsubtitle_menu textarea{
    border: 1px solid black !important;
    box-sizing: border-box !important;
    margin: initial !important;
    padding: initial !important;
}
#addsubtitle_menu *{
    font-family: monospace !important;
    font-size: 12px !important;
}
#addsubtitle_menu p{
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

var the_video_element = null;

function update_video_elements_list(){
    var video_elements = document.getElementsByTagName("video");
    var video_elements_list = document.getElementById("video_elements_list");
    video_elements_list.innerHTML = "";
    for(var i = 0; i < video_elements.length; i++){
        var video_list_item = document.createElement("div");
        video_list_item.className = "video_list_item";
        video_list_item.textContent = video_elements[i].currentSrc;
        (function(){
            var current_video_element = video_elements[i];
            video_list_item.addEventListener("mouseenter", function(){
                this.classList.add("hover_video_list");
                current_video_element.classList.add("hover_video_element");
            });
            video_list_item.addEventListener("mouseleave", function(){
                this.classList.remove("hover_video_list");
                current_video_element.classList.remove("hover_video_element");
            });
            video_list_item.addEventListener("click", function(){
                var list = document.getElementsByClassName("video_list_item");
                for(var i = 0; i < list.length; i++){
                    list[i].classList.remove("selected_video_list");
                }
                if(the_video_element == current_video_element){
                    the_video_element = null;
                    document.getElementById("make_video_fullscreen").disabled = true;
                    subtitle_element.innerHTML = "";
                }
                else{
                    the_video_element = current_video_element;
                    document.getElementById("make_video_fullscreen").disabled = false;
                    this.classList.add("selected_video_list");
                    subtitle_pos();
                }
            });
        }());
        video_elements_list.append(video_list_item);
    }
}

var subtitle_element = document.getElementById("subtitle_element");
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
    var t = the_video_element.currentTime;
    var found = -1;
    for(var i = 0; i < subtitles.length; i++){
        if(subtitles[i].begin+subtitle_offset <= t && subtitles[i].end+subtitle_offset >= t){
            found = i;
            break;
        }
    }
    if(found == -1){
        subtitle_element.textContent = "";
    }
    else{
        subtitle_element.textContent = subtitles[found].text;
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
    if(video_fullscreen){
        var sub_pos_top = the_video_element.getBoundingClientRect().top+the_video_element.offsetHeight+subtitle_position;
        var sub_pos_left = get_offset(the_video_element)[1];
        subtitle_element.style.position = "fixed";
        subtitle_element.style.width = the_video_element.offsetWidth+"px";
        subtitle_element.style.top = sub_pos_top+"px";
        subtitle_element.style.left = sub_pos_left+"px";
    }
    else{
        var sub_pos_top = the_video_element.offsetHeight+get_offset(the_video_element)[0]+subtitle_position;
        var sub_pos_left = get_offset(the_video_element)[1];
        subtitle_element.style.position = "absolute";
        subtitle_element.style.width = the_video_element.offsetWidth+"px";
        subtitle_element.style.top = sub_pos_top+"px";
        subtitle_element.style.left = sub_pos_left+"px";
    }
}

function time_parse(t){
    var split = t.split(":");
    var hours = split[0]*60*60;
    var minutes = split[1]*60;
    var seconds = parseFloat(t.split(":")[2].replace(",", "."));
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

function switch_fullscreen_video(){
    if(the_video_element == null) return;

    video_fullscreen = true;

    if(!document.getElementById("fullscreen_video_black_background")){
        var black_background = document.createElement("div");
        black_background.id = "fullscreen_video_black_background";
        black_background.style.backgroundColor = "black";
        black_background.style.margin = "0px";
        black_background.style.padding = "0px";
        black_background.style.position = "absolute";
        black_background.style.top = "0px";
        black_background.style.left = "0px";
        black_background.style.zIndex = "99997";
        black_background.style.width = "100%";
        black_background.style.height = "100%";
        document.body.append(black_background);
    }

    document.getElementById("subtitle_element").style.zIndex = "99999";
    document.documentElement.overflow = "hidden";
    document.body.style.overflow = "hidden";
    the_video_element.style.position = "fixed";
    the_video_element.style.top = "0px";
    the_video_element.style.left = "0px";
    the_video_element.style.zIndex = "99998";
    the_video_element.style.width = "100%";
    the_video_element.style.height = "100%";

    subtitle_pos();
}

update_video_elements_list();
document.getElementById("refresh_video_list").addEventListener("click", function(){
    update_video_elements_list();
    subtitle_pos();
});

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
    document.getElementById("subtitle_element").style.zIndex = "99999";
    subtitle_pos();
});

document.getElementById("make_video_fullscreen").addEventListener("click", function(){
    switch_fullscreen_video();
});

window.addEventListener("resize", function(){
    subtitle_pos();
});

})();