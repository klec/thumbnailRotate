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
        //$(this.containerId+'-upload').observe("click", function(event) {that.upload(event, that);});
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
        var that = this;
        $$("#uploadBlocks canvas").each(function(canva){
            var file = canva.mozGetAsFile(canva.readAttribute('alt').toLowerCase());
            that.sendFile(file);

            });
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

    updateFile: function (file, id)
    {
        file['id']=id;
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

    },

    readNextFile: function() {
        file = this.inputFiles.files[++this.fileInputId];
        if (file == undefined) {
            this.fileInputId = -1;
        } else {
            this.updateFile(file, this.fileInputId);
            this.reader.readAsDataURL(file);

        }
    },

    sendFile: function(file) {
        var fd = new FormData();
        fd.append("name", file.name.toLowerCase());
        fd.append("image", file);
        fd.append("form_key", this.config.params.form_key);
        var xhr = new XMLHttpRequest();
        xhr.open("POST", this.config.url);
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                if(xhr.status == 200) {
                    rotate_gallery_contentJsObject.createImageRow(JSON.parse(xhr.responseText));
                }
            }
        };
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

//@todo move javascript to separate file
//@todo add auto order for loaded images
Element.addMethods({
    move: function (element) {
        if (dragObject.previous() && parseInt(dragObject.previous().style.left) > parseInt(dragObject.style.left)) {
            temp = dragObject.previous();
            dragObject.previous().remove();
            dragObject.insert({'after': temp});
            dragObject.next().style.left = dragObject.next().getId() * step + "px";
        }
        if (dragObject.next() && parseInt(dragObject.next().style.left) < parseInt(dragObject.style.left)) {
            temp = dragObject.next();
            dragObject.next().remove();
            dragObject.insert({'before': temp});
            dragObject.previous().style.left = dragObject.previous().getId() * step + "px";
        }
    },
    getId: function (element) {
        images = $$('.image_wrapper IMG');
        for (var i in images) {
            if (images[i] === element) return i;
        }
        return -1;
    },
    changeopacity: function (element) {
        var object = element.style;
        var opacity = (element.removed) ? 20 : 100;
        object.opacity = ( opacity / 100 );
        object.MozOpacity = ( opacity / 100 );
        object.KhtmlOpacity = ( opacity / 100 );
        object.filter = 'alpha(opacity=' + opacity + ')';

    }
})

RotateGallery = Class.create(Product.Gallery, {
    createImageRow: function (img) {
        image_wraper.insert(
            new Element('img', {
                id: this.prepareId(img.file),
                src: img.url,
                style: 'height:150px; position:absolute;',//todo move to CSS
                value_id: img.value_id,
                file: img.file,
                disabled: 0,
                removed: 0,
                label: ''
            }).observe('mouseover',function () {
                    $('big_img').setAttribute('src', this.readAttribute('src'));
                    this.style.zIndex = "10";
                }).observe('mouseout',function () {
                    this.style.zIndex = "0";
                }).observe('mousedown',function (e) {
                    dragObject = this;
                    dragObject.removed = this.getAttribute('removed') == "1";
                    e = fixEvent(e);
                    dragObject.downX = e.pageX;
                }).observe('mouseup',function (e) {
                    if (dragObject.style.left == dragObject.getId() * step + "px") {
                        dragObject.removed = !dragObject.removed;
                        dragObject.changeopacity();
                    }
                    dragObject.style.left = dragObject.getId() * step + "px";
                    dragObject.setAttribute('removed', (dragObject.removed) ? 1 : 0);
                    dragObject = {};
//$('<?php echo $_block->getHtmlId() ?>_save').value = images2json();
                }).observe('mousemove', function (e) {
                    if (dragObject.downX) {
                        e = fixEvent(e);
                        dragObject.style.left = parseInt(dragObject.style.left) + e.pageX - dragObject.downX + "px";
                        dragObject.downX = e.pageX;
                        dragObject.move();
                    }
                })
        );
        this.updateImages();
    },
    updateVisualisation: function () {
        $$('.image_wrapper IMG').each(function (img, id) {
            img.style.left = id * step + "px";
        })
    },
    updateImages: function () {
        this.getElement('save').value = images2json();
        this.images.each(function (row) {
            if (!$(this.prepareId(row.file))) {
                this.createImageRow(row);
            }
            this.updateVisualisation(row.file);
        }.bind(this));
    },
    prepareId: function (file) {
        if (typeof this.file2id[file] == 'undefined') {
            this.file2id[file] = this.idIncrement++;
        }
        return this.containerId + '-image-' + this.file2id[file];
    }
});


function images2json() { //@todo move to RotateGallery class
    var answer = [];
    $$('.image_wrapper IMG').each(function (img, id) {
        answer.push({
            'value_id': (img.getAttribute('value_id') == "undefined") ? null : img.getAttribute('value_id'),
            'file': img.getAttribute('file'),
            'label': img.getAttribute('label'),
            'position': id,
            'url': img.getAttribute('src'),
            'disabled': 0,
            'removed': img.getAttribute('removed')
        });

    })
    return Object.toJSON(answer);
}
function fixEvent(e) {
    e.preventDefault ? e.preventDefault() : e.returnValue = false;
    e = e || window.event
    if (e.pageX == null && e.clientX != null) {
        var html = document.documentElement
        var body = document.body
        e.pageX = e.clientX + (html && html.scrollLeft || body && body.scrollLeft || 0) - (html.clientLeft || 0);
    }
    return e
}


