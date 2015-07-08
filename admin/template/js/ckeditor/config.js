﻿
// GetSimpleCMS config file for CKeditor 3.6.2

// default editor config
CKEDITOR.editorConfig = function( config )
{
	// Define changes to default configuration here.
    config.skin                        = 'getsimple';
	
    config.defaultLanguage             = 'en';
	config.resize_dir                  = 'vertical'; // vertical resize
	config.toolbarCanCollapse          = false;      // hide toolbar collapse button
    config.forcePasteAsPlainText       = true;
    config.tabSpaces                   = 10;    

	config.dialog_backgroundCoverColor = '#000000';  // veil color for dialog popups
    config.uiColor                     = '#FFFFFF';
	config.magicline_color             = '#CF3805'; 
    config.entities                    = false;    

    
    config.filebrowserBrowseUrl        = 'upload.php?browse&type=all';
    config.filebrowserImageBrowseUrl   = 'upload.php?browse&type=images';

    // customize file browser popup windows below
    // config.filebrowserWindowWidth      = '960';
    // config.filebrowserWindowHeight     = '700';

	config.allowedContent              = true;       // disable acf
	config.disableAutoInline           = true;       // disable automatic inline editing of elements with contenteditable=true

	// config.extraPlugins                = 'autogrow'; // auto grow plugin

	config.toolbar_advanced = 
		[['Bold', 'Italic', 'Underline', '-', 'NumberedList', 'BulletedList', '-', 'JustifyLeft','JustifyCenter','JustifyRight','JustifyBlock', '-', 'Link', 'Unlink', 'Image', 'RemoveFormat', '-', 'Table', 'TextColor', 'BGColor', 'ShowBlocks'], ['Source'], ['Maximize'],
		'/',
		['Styles','Format','Font','FontSize']];	

	config.toolbar_basic = 
		[['Bold', 'Italic', 'Underline', '-', 'NumberedList', 'BulletedList', '-', 'JustifyLeft','JustifyCenter','JustifyRight','JustifyBlock', '-', 'Link', 'Unlink', 'Image', 'RemoveFormat'], ['Source'], ['Maximize'] ];

	// add about if debug mode
	if(GS.debug === true){
		config.toolbar_advanced.push(Array("About"));
		config.toolbar_basic.push(Array("About"));
	}

};



/** ------------------------------------------------------------------------
 * GS Default overrides and extras
 * DO NOT EDIT BELOW THIS LINE
 */
// prevent removal of empty inline tags
CKEDITOR.dtd.$removeEmpty['i']    = false;
CKEDITOR.dtd.$removeEmpty['span'] = false;


// Override default block element source formatting
CKEDITOR.on( 'instanceReady', function( ev ) {
	var blockTags = ['div','h1','h2','h3','h4','h5','h6','p','pre','li','blockquote','ul','ol','table','thead','tbody','tfoot','td','th',];
	var rules = {
		indent           : true,
		breakBeforeOpen  : true,
		breakAfterOpen   : false,
		breakBeforeClose : false,
		breakAfterClose  : true
	};

	for (var i=0; i<blockTags.length; i++) {
		ev.editor.dataProcessor.writer.setRules( blockTags[i], rules );
	}
}); 

// Disable some dialog fields we do not need
CKEDITOR.on( 'dialogDefinition', function( ev )	{
		var dialogName = ev.data.name;
		var dialogDefinition = ev.data.definition;
		ev.data.definition.resizable = CKEDITOR.DIALOG_RESIZE_NONE;
		var infoTab;
		var advTab;

		if ( dialogName == 'link' ) {
			infoTab = dialogDefinition.getContents( 'info' );
			//dialogDefinition.removeContents( 'target' );
			advTab = dialogDefinition.getContents( 'advanced' );
			advTab.remove( 'advLangDir' );
			advTab.remove( 'advLangCode' );
			advTab.remove( 'advContentType' );
			// advTab.remove( 'advTitle' );
			advTab.remove( 'advCharset' );
		}

		if ( dialogName == 'image' ) {
			infoTab = dialogDefinition.getContents( 'info' );
			infoTab.remove( 'txtBorder' );
			infoTab.remove( 'txtHSpace' );
			infoTab.remove( 'txtVSpace' );
			infoTab.remove( 'btnResetSize' );
			dialogDefinition.removeContents( 'Link' );
			advTab = dialogDefinition.getContents( 'advanced' );
			advTab.remove( 'cmbLangDir' );
			advTab.remove( 'txtLangCode' );
			advTab.remove( 'txtGenLongDescr' );
			advTab.remove( 'txtGenTitle' );
		}
});

// set default link to url
// linkdefault = "url";

var menuItems;

$.getJSON("inc/ajax.php?list_pages_json=1", function (data){
	menuItems = data;
	CKEsetupLinks();
});

/**
 * CKEditor Add Local Page Link
 * This is used by the CKEditor to link to internal pages
 * @param editorObj	an editor instance
 */
CKEsetupLinks = function(){

	// if (typeof editorObj === "undefined") return;
	CKEDITOR.on( 'dialogDefinition', function( ev )	{
		// console.log(ev.editor);
		// console.log(ev.data.name);
		// console.log(menuItems);
		if ((ev.data.name != 'link') || !menuItems) return;

		// modify dialog definition for "link" dialog else return

		var definition = ev.data.definition;

		// override onfocus handler
		// Supposed to select the select box, not working
		definition.onFocus = CKEDITOR.tools.override(definition.onFocus, function(original) {
			return function() {
				original.call(this);
					if (this.getValueOf('info', 'linkType') == 'localPage') {
						// this.getContentElement('info', 'localPage_path').select(); // disabled, object has no method select
					}
			};
		});

		// Add localpage to linktypes
		var infoTab = definition.getContents('info');
		var content = CKEgetById(infoTab.elements, 'linkType');

		content.items.unshift(['Link to local page', 'localPage']);
		content['default'] = 'localPage';
		infoTab.elements.push({
			type: 'vbox',
			id: 'localPageOptions',
			children: [{
				type: 'select',
				id: 'localPage_path',
				label: 'Select page:',
				required: true,
				items: menuItems,
				setup: function(data) {
					if ( data.localPage )
						this.setValue( data.localPage );
				}
			}]
		});

		// hide and show tabs and stuff as type i changed
		content.onChange = CKEDITOR.tools.override(content.onChange, function(original) {
			return function() {
				original.call(this);
				var dialog = this.getDialog();
				var element = dialog.getContentElement('info', 'localPageOptions').getElement().getParent().getParent();
				if (this.getValue() == 'localPage') {
					element.show();
					if (ev.editor.config.linkShowTargetTab) {
						dialog.showPage('target');
					}
					var uploadTab = dialog.definition.getContents('upload');
					if (uploadTab && !uploadTab.hidden) {
						dialog.hidePage('upload');
					}
				}
				else {
					element.hide();
				}
			};
		});

		content.setup = function(data) {
			// if no url set selection to localpage
			if (!data.type || (data.type == 'url') && !data.url) {
				data.type = 'localPage'; // default to localPage
				if(typeof(linkdefault) !== 'undefined') data.type = linkdefault;
			}
			else if (data.url && !data.url.protocol && data.url.url) {
			// already a link
				if (path) {
					// what is path, this seems to do nothing
					data.type = 'localPage';
					data.localPage_path = path;
					delete data.url;
				}
			}
			this.setValue(data.type);
		};

		content.commit = function(data) {
			data.type = this.getValue();
			if (data.type == 'localPage') {
				data.type = 'url';
				var dialog = this.getDialog();
				dialog.setValueOf('info', 'protocol', '');
				dialog.setValueOf('info', 'url', dialog.getValueOf('info', 'localPage_path'));
			}
		};
	},null,null,1); 
};


// Helper function to get a CKEDITOR.dialog.contentDefinition object by its ID.
CKEgetById = function(array, id, recurse) {
	for (var i = 0, item; (item = array[i]); i++) {
		if (item.id == id) return item;
			if (recurse && item[recurse]) {
				var retval = CKEgetById(item[recurse], id, recurse);
				if (retval) return retval;
			}
	}
	return null;
};

var getById = CKEgetById; // alias for legacy
