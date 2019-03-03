jQuery(document).ready(function(){
	if(jQuery('.comments-row').size() > 0){
		Read('Page Comments');
	}
});

// occurs when a user clicks the Add Comments button
function Create(listname) {
    var listName = listname;
    var url = _spPageContextInfo.siteAbsoluteUrl;
    var title = 'comment'+Math.floor(Date.now() / 1000);
        
    var body = jQuery('#Create_Body').val();
    var currentpage = _spPageContextInfo.pageItemId.toString();
    createListItemWithDetails(listName, url, title, body, currentpage, function () {
        Read(listName);
    }, function () {
        console.log("Ooops, an error occured. Please try again");
    });
    
    Read(listName);
}

// gets the number of comments per page to display on display template
function ReadCounts(pageid,elementID,linkURL){

    var listName = 'Page Comments';
    var url = _spPageContextInfo.siteAbsoluteUrl;
    var currentrollupitem = pageid.toString();
    
    getListItems(listName, url, function (data) {
        var items = data.d.results;
        var itemcount = 0;
        						
        // Add all the new items
        for (var i = 0; i < items.length; i++) {
						            
			if(items[i].CommentPageID == currentrollupitem){
				itemcount++;
			}
			
        }
        
	    elementID.find('.comments-count .comments-actual-count').text(itemcount);
	    
        if(itemcount == 0 || itemcount > 1){
			elementID.append('<a class="commentsbutton" href="'+linkURL+'">Comments</a>');
        }
        else{
			elementID.append('<a class="commentsbutton" href="'+linkURL+'">Comment</a>');
        }

    }, function (data) {
        console.log("Ooops, an error occured. Please try again");
    });

}

// occurs on load
function Read(listname) {
    //clear comment box
    jQuery('#Create_Body').val('');

    var listName = listname;
    var url = _spPageContextInfo.siteAbsoluteUrl;
    var currentpage = _spPageContextInfo.pageItemId.toString();
    var currentuser = _spPageContextInfo.userId.toString();

    getListItems(listName, url, function (data) {
        var items = data.d.results;
						
        // remove all of the previous items
        jQuery('.comment-list').html('');

        // Add all the new items
        for (var i = 0; i < items.length; i++) {
            
            var thisTitle = items[i].ID;
            var updateBody = jQuery(items[i].Body).text();
			var displayBody = updateBody.replace(/\n/g,'<br />');
            
			var thisModDate = jQuery.datepicker.formatDate('MM dd, yy', new Date(items[i].Created));
			var thisModDateHours = new Date(items[i].Created).getHours();
			var thisModDateMinutes = new Date(items[i].Created).getMinutes();
			var ampm = 'AM';
			
            var authLogin = items[i].Author.Name;
            var authID = items[i].Author.ID;
            var authLoginName = authLogin.substring(authLogin.indexOf('membership|')+11);
            
			if(thisModDateHours > 12){
				thisModDateHours = thisModDateHours -12;
				var ampm = 'PM';
			}
			if(thisModDateMinutes.toString().length < 2){
				thisModDateMinutes = '0'+thisModDateMinutes;
			}
						            
			if(authID == currentuser){
				if(items[i].CommentPageID == currentpage){
					jQuery('.comment-list').append('<div class="comment-wrapper"><div class="comment-author row"><div class="comment-tools"><span class="comment-save" style="display:none"><a onclick="Update(&quot;'+thisTitle+'&quot;,&quot;#Update_Body'+thisTitle+'&quot;);"><i class="fa fa-fw"></i></a></span><span class="comment-cancel" style="display:none"><a href="#""><i class="fa fa-fw"></i></a></span><span class="comment-edit"><a href="#"><i class="fa fa-fw"></i></a></span><span class="comment-delete"><a onclick="Delete(&quot;'+thisTitle+'&quot;);"><i class="fa fa-fw"></i></a></span></div><div class="comment-update" style="display:none"><textarea id="Update_Body'+thisTitle+'" rows="4">'+updateBody+'</textarea></div><div class="author-info"><div class="author-name">'+items[i].Author.Title+'</div><div class="comment-time">commented on '+thisModDate+' at '+thisModDateHours+':'+thisModDateMinutes+' '+ampm+'</div></div></div><div class="comment-body">'+displayBody+'</div></div>');
				}
			}
			else{
				if(items[i].CommentPageID == currentpage){
					jQuery('.comment-list').append('<div class="comment-wrapper"><div class="comment-author row"><div class="author-info"><div class="author-name">'+items[i].Author.Title+'</div><div class="comment-time">commented on '+thisModDate+' at '+thisModDateHours+':'+thisModDateMinutes+' '+ampm+'</div></div></div><div class="comment-body">'+items[i].Body+'</div></div>');
				}
			}
			
        }
        
        // Add alternating class
        jQuery('.comment-wrapper').each(function(i){
			if(i%2 == 0){
				jQuery(this).addClass('alternate');
			}
        });
        
       	commentTools();

    }, function (data) {
        console.log("Ooops, an error occured. Please try again");
    });
}

//add click actions to comment edit tools
function commentTools(){
	jQuery('.comment-edit > a').click(function(e){
		e.preventDefault();
		jQuery(this).parent().hide();
		jQuery(this).closest('.ct-comment-wrapper').find('.author-info').hide();
		jQuery(this).closest('.ct-comment-wrapper').find('.comment-body').hide();
		jQuery(this).closest('.ct-comment-wrapper').find('.comment-save').show();
		jQuery(this).closest('.ct-comment-wrapper').find('.comment-cancel').show();
		jQuery(this).closest('.ct-comment-wrapper').find('.comment-update').show();
	});
	jQuery('.comment-cancel > a').click(function(e){
		e.preventDefault();
		jQuery(this).parent().hide();
		jQuery(this).closest('.ct-comment-wrapper').find('.author-info').show();
		jQuery(this).closest('.ct-comment-wrapper').find('.comment-edit').show();
		jQuery(this).closest('.ct-comment-wrapper').find('.comment-body').show();
		jQuery(this).closest('.ct-comment-wrapper').find('.comment-save').hide();
		jQuery(this).closest('.ct-comment-wrapper').find('.comment-update').hide();
	});
}


// occurs when a user clicks edit save button
function Update(commentID,bodyID,listname) {
    var listName = listname;
    var url = _spPageContextInfo.siteAbsoluteUrl;
    var itemId = commentID;
    var body = jQuery(bodyID).val();
    updateListItem(itemId, listName, url, body, function () {
        Read(listName);
    }, function () {
        console.log("Ooops, an error occured. Please try again");
    });

}


// occurs when a user clicks the delete button
function Delete(commentID,listname) {
    var listName = listname;
    var url = _spPageContextInfo.siteAbsoluteUrl;
    var itemId = commentID;
    deleteListItem(itemId, listName, url, function () {
        Read(listName);
    }, function () {
        console.log("Ooops, an error occured. Please try again");
    });
}

// Delete Operation
// itemId: the id of the item to delete
// listName: The name of the list you want to delete the item from
// siteurl: The url of the site that the list is in. 
// success: The function to execute if the call is sucesfull
// failure: The function to execute if the call fails
function deleteListItem(itemId, listName, siteUrl, success, failure) {
    getListItemWithId(itemId, listName, siteUrl, function (data) {
        jQuery.ajax({
            url: data.__metadata.uri,
            type: "POST",
            headers: {
                "Accept": "application/json;odata=verbose",
                "X-Http-Method": "DELETE",
                "X-RequestDigest": jQuery("#__REQUESTDIGEST").val(),
                "If-Match": data.__metadata.etag
            },
            success: function (data) {
                success(data);
            },
            error: function (data) {
                failure(data);
            }
        });
    },
   function (data) {
       failure(data);
   });
}


// Update Operation
// listName: The name of the list you want to get items from
// siteurl: The url of the site that the list is in. // title: The value of the title field for the new item
// itemId: the id of the item to update
// success: The function to execute if the call is sucesfull
// failure: The function to execute if the call fails
function updateListItem(itemId, listName, siteUrl, body, success, failure) {
    var itemType = GetItemTypeForListName(listName);

    var item = {
        "__metadata": { "type": itemType },
        "Body": body
    };

    getListItemWithId(itemId, listName, siteUrl, function (data) {
        jQuery.ajax({
            url: data.__metadata.uri,
            type: "POST",
            contentType: "application/json;odata=verbose",
            data: JSON.stringify(item),
            headers: {
                "Accept": "application/json;odata=verbose",
                "X-RequestDigest": jQuery("#__REQUESTDIGEST").val(),
                "X-HTTP-Method": "MERGE",
                "If-Match": data.__metadata.etag
            },
            success: function (data) {
                success(data);
            },
            error: function (data) {
                failure(data);
            }
        });
    }, function (data) {
        failure(data);
    });
}

// READ SPECIFIC ITEM operation
// itemId: The id of the item to get
// listName: The name of the list you want to get items from
// siteurl: The url of the site that the list is in. 
// success: The function to execute if the call is sucesfull
// failure: The function to execute if the call fails
function getListItemWithId(itemId, listName, siteurl, success, failure) {
    var url = siteurl + "/_api/web/lists/getbytitle('" + listName + "')/items?$filter=Id eq " + itemId;
    jQuery.ajax({
        url: url,
        method: "GET",
        headers: { "Accept": "application/json; odata=verbose" },
        success: function (data) {
            if (data.d.results.length == 1) {
                success(data.d.results[0]);
            }
            else {
                failure("Multiple results obtained for the specified Id value");
            }
        },
        error: function (data) {
            failure(data);
        }
    });
}

// READ operation
// listName: The name of the list you want to get items from
// siteurl: The url of the site that the list is in. 
// success: The function to execute if the call is sucesfull
// failure: The function to execute if the call fails
function getListItems(listName, siteurl, success, failure) {
    jQuery.ajax({
        url: siteurl + "/_api/web/lists/getbytitle('" + listName + "')/items?$orderby=Created desc&$select=Author/Name,Author/Title,Author/ID,Body,CommentPageID,Title,ID,Created&$expand=Author",
        method: "GET",
        headers: { "Accept": "application/json; odata=verbose" },
        success: function (data) {
            success(data);
        },
        error: function (data) {
            failure(data);
        }
    });
}

// CREATE Operation
// listName: The name of the list you want to get items from
// siteurl: The url of the site that the list is in. // title: The value of the title field for the new item
// success: The function to execute if the call is sucesfull
// failure: The function to execute if the call fails
function createListItemWithDetails(listName, siteUrl, title, body, currentpage, success, failure) {
		
    var itemType = GetItemTypeForListName(listName);
    var item = {
        "__metadata": { "type": itemType },
        "Title": title,
        "Body": body,
        "CommentPageID": currentpage
    };

    jQuery.ajax({
        url: siteUrl + "/_api/web/lists/getbytitle('" + listName + "')/items",
        type: "POST",
        contentType: "application/json;odata=verbose",
        data: JSON.stringify(item),
        headers: {
            "Accept": "application/json;odata=verbose",
            "X-RequestDigest": jQuery("#__REQUESTDIGEST").val()
        },
        success: function (data) {
            success(data);
        },
        error: function (data) {
            failure(data);
        }
    });
}

function GetItemTypeForListName(name) {
    return "SP.Data." + name.charAt(0).toUpperCase() + name.replace(/ /g,'_x0020_').slice(1) + "ListItem";
}