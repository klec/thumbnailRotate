RUploader = Class.create();
RUploader.prototype = {
    uploader: null,
    containerId: null,
    container: null,
    config: null,
    id: 0,
    files: [],
    fileIdPrefix: 'file_',
    fileRowTemplate: null,
    templatesPattern: /(^|.|\r|\n)(\{\{(.*?)\}\})/,
    templateSuffix: '-uploadBlockTemplate',
    htmlIdBlocks: 'uploadBlocks',
    reader: new FileReader(),
    statusComplete: 'full_complete',
    statusError: 'error',
    statusNew: 'new',
    fileInputId: -1,
    inputFiles: null,
    onFilesComplete: false,
    onFileRemove: false,
    
    initialize: function(containerId, config)
    {
        this.containerId = containerId;
        this.container   = $(containerId);
        this.inputFiles = $('rotate_upload_images');
        this.container.controller = this;

        this.config = config;
        var that = this;
        $(this.containerId+'-upload').observe("click", function(event) {that.upload(event, that);});
        this.inputFiles.observe("change", function(event) {that.select(event, that);});
        this.fileRowTemplate = new Template(
            this.getInnerElement('template').innerHTML.trim(),
            this.templatesPattern
        );
        this.initUploadBlocks();
    },
    
    getInnerElement: function(elementName)
    {
        return $(this.containerId + '-' + elementName);
    },

    getValues: function(reference)
    {
        return {id: reference.id, url: reference.config.url, formKey: reference.config.params.form_key};
    },

    getFileId: function(file)
    {
        var id;
        
        if (typeof file == 'object')
        {
            id = file.id;
        } else
        {
            id = file;
        }
        
        return this.containerId + '-file-' + id;
    },
    
    getDeleteButton: function(file)
    {
        return $(this.getFileId(file) + '-delete');
    },

    browse: function()
    {
        this.inputFiles.click();
    },

    initUploadBlocks: function()
    {
        //Element.insert($(this.htmlIdBlocks), {bottom: this.createTemplate(this).evaluate(this.getValues(this))});
        //this.addUploadBlock(this.getValues(this));
    },

    createTemplate: function(reference)
    {
        return new Template(
            $(reference.containerId + reference.templateSuffix).innerHTML,
            reference.templatesPattern
        );
    },

    select: function(event, that)
    {
        var inputFile = this.inputFiles;
        if(inputFile.files.length >0 ){
            var uploadBlock = "";
            for (var x = 0; x < inputFile.files.length; x++) {
                var file = Object();
                file.id = that.fileIdPrefix + (that.id++);
                file.name = inputFile.files[x].name;
                file.status = that.statusNew;
                file.creator = null;
                file.size = 0;
                that.files.push(file);
            }
        }
        that.handleSelect();
    },

    upload: function()
    {
        //@todo select canvas from upload block;
        var canvas = $(this.containerId+"-file-undefined").down('canvas');
        var file = canvas.mozGetAsFile("foo.png");
        this.sendFile(file);

//        var iframes = $$("#uploadBlocks .uploadBlock iframe");
//        var lastFormsNumber = iframes.length - 1;
//
//        for (var i = lastFormsNumber; i > 0; --i)
//        {
//            var uploadFile = Object();
//            uploadFile.id = this.fileIdPrefix + i;
//            //this.progressMethod(uploadFile);
//
//            var that = this;
//            ++this.unfinishedUploads;
//
//            var iframeOnLoad = function(event)
//            {
//                that.setupUploadFiles(this, that, event);
//            }
//
//            if (window.addEventListener){
//                iframes[i].addEventListener('load', iframeOnLoad, false);
//            } else {
//                iframes[i].attachEvent('onload', iframeOnLoad); // for IE
//            }
//        }
//
//        for (var i = lastFormsNumber; i > 0; --i)
//        {
//            $$("#uploadBlocks .uploadBlock form")[i].submit();
//        }
//        this.updateFiles();
    },


    removeFile: function(id)
    {
        this.uploader.removeFile(id);
        $(this.getFileId(id)).remove();
        
        if (this.onFileRemove)
        {
            this.onFileRemove(id);
        }
        
        this.files = this.uploader.getFilesInfo();
        this.updateFiles();
    },
    
    handleSelect: function()
    {
        this.updateFiles();
        this.getInnerElement('upload').show();
    },
    
    handleProgress: function(file)
    {
        this.updateFile(file);
        
        this.onFileProgress(file);
    },
    
    handleError: function(file)
    {
        this.updateFile(file);
    },
    
    handleComplete: function(files)
    {
        this.files = files;
        this.updateFiles();
        
        if (this.onFilesComplete)
        {
            this.onFilesComplete(this.files);
        }
        
    },

    updateFiles: function ()
    {
        if(this.inputFiles.files.length >0 ){
            this.readNextFile();
        }
    },
    
    updateFile: function (file)
    {
    
        if (true || !$(this.getFileId(file)))
        {
            var insertContent = this.fileRowTemplate.evaluate(this.getFileVars(file));
            Element.insert(this.htmlIdBlocks, {bottom: insertContent});
            var inserted = $(this.htmlIdBlocks).lastChild;
            var img = inserted.down('img');
            var canva = inserted.down('canvas');
            var that = this;
            this.reader.onload = function(e) {
                img.src = e.target.result;
                canva.width = img.width;
                canva.height = img.height;
                var ctx = canva.getContext("2d").drawImage(img, 0, 0);
                img.height=50;
                that.readNextFile();
            }
        }
        
//        if (file.status == 'full_complete' && file.response.isJSON())
//        {
//            var response = file.response.evalJSON();
//
//            if (typeof response == 'object')
//            {
//
//                if (typeof response.cookie == 'object')
//                {
//                    var date = new Date();
//                    date.setTime(date.getTime()+(parseInt(response.cookie.lifetime)*1000));
//
//                    document.cookie = escape(response.cookie.name) + "="
//                        + escape(response.cookie.value)
//                        + "; expires=" + date.toGMTString()
//                        + (response.cookie.path.blank() ? "" : "; path=" + response.cookie.path)
//                        + (response.cookie.domain.blank() ? "" : "; domain=" + response.cookie.domain);
//                }
//
//                if (typeof response.error != 'undefined' && response.error != 0) {
//                    file.status = 'error';
//                    file.errorText = response.error;
//                }
//            }
//        }
//
//        if (file.status == 'full_complete' && !file.response.isJSON())
//        {
//            file.status = 'error';
//        }
//
//        var progress = $(this.getFileId(file)).getElementsByClassName('progress-text')[0];
//
//        if (file.status=='error')
//        {
//            $(this.getFileId(file)).addClassName('error');
//            $(this.getFileId(file)).removeClassName('progress');
//            $(this.getFileId(file)).removeClassName('new');
//
//            var errorText = file.errorText;
//
//            progress.update(errorText);
//
//            this.getDeleteButton(file).show();
//
//        } else if (file.status=='full_complete')
//        {
//            $(this.getFileId(file)).addClassName('complete');
//            $(this.getFileId(file)).removeClassName('progress');
//            $(this.getFileId(file)).removeClassName('error');
//
//            progress.update(this.translate('Complete'));
//        }
    },

    readNextFile: function() {
        file = this.inputFiles.files[++this.fileInputId];
        if (file == undefined) {
            this.fileInputId = -1;
        } else {
            this.updateFile(file);
            this.reader.readAsDataURL(file);

        }
    },

    sendFile: function(file) {
        var fd = new FormData();
        fd.append("name", "paul");
        fd.append("image", file);
        fd.append("form_key", this.config.params.form_key);
        var xhr = new XMLHttpRequest();
        xhr.open("POST", this.config.url);
        xhr.send(fd);
    },

    getFileVars: function(file)
    {
        return {
            id      : this.getFileId(file),
            fileId  : file.id,
            name    : file.name,
            size    : file.size
        };
    },

    translate: function(text)
    {
        if(Translator)
        {
            return Translator.translate(text);
        }
        return text;
    },
    
    onFileProgress: function(file)
    {
        $(this.getFileId(file)).addClassName('progress');
        $(this.getFileId(file)).removeClassName('new');
        $(this.getFileId(file)).removeClassName('error');
    
        var progress = $(this.getFileId(file)).getElementsByClassName('progress-text')[0];
        progress.update(this.translate('Uploading'));

        if (!this.config.replace_browse_with_remove)
        {
            this.getDeleteButton(file).hide();
        }
        
    }
}