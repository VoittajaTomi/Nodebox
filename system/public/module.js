function paivita(){
  
  $.getJSON(
    "/uploads.json",
    function (files) {
      $("#file-list").empty();
      files.forEach(function (file) {
        //$("#file-list").append($('<li></li>').text(file.filename)
        var a  = $('<a>').attr('href', "/"+file._id+"/download").text(file.filename); $('<li>').append(a).appendTo('#file-list');
      });
    }
  );
};

paivita();

Dropzone.options.myAwesomeDropzone = {
  init: function() {
    this.on("addedfile", paivita)
    this.on("success", paivita);
    this.on("uploadprogress", function(file,progress,bytesSent){
    
        document.title = "uploading";
      
    });
    
  }
};
                