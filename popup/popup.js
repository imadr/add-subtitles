const subtitle_file_input = document.getElementById("subtitle_file_input");
subtitle_file_input.addEventListener("change", hande_filepick, false);

function hande_filepick(){
    console.log(this.files);
}