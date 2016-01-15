var queryCount = 100; 
var minPages = 3;
var minElements = 5;
var projects = [];
var openedProjects = [];

var fetchCount, displayCount, listPage;

function setDefaultCounts(){
  fetchCount = 0;
  displayCount = 0;
  listPage = 1;
}

function buildHTML(projectMeta){
  var href = 'https://beta.webmaker.org/#/player?user=' + projectMeta.user_id + '&project=' + projectMeta.id;
  var thumb = '<a class="thumb-link" href="'+ href +'" target="_blank" ><img src="' + projectMeta.thumbnail[320] + '" ></a>';
  var title = '<h3><b>' + projectMeta.title + '</b> by ' + projectMeta.author.username + ' <span class="project-id">(' + projectMeta.id + ')</span></h3>';
  if (projectMeta.description) { 
    var description = '<p class="description">' + projectMeta.description + '</p>' 
  } else { var description = ''; };
  var html = '<div id="p' + projectMeta.id + '" class="project">' + thumb + title + description + '</div>';
  return html;
}

function renderStats(){
  var displayed = Math.floor((displayCount / fetchCount) * 100);
  var stats = '';
  stats += '<li>projects searched: ' + fetchCount + '</li>';
  stats += '<li>remixes: not included</li>';
  stats += '<li>displayed: ' + displayed + '%</li>';
  $('#stats ul').html(stats);
}

function renderProject(projectMeta){
  var html = buildHTML(projectMeta);
  $('#app').append(html);
  renderStats();  
}

function testPages(key,user,pid,projectMeta){
  $.getJSON( 'https://api.webmaker.org/users/' + user + '/projects/' + pid + '/pages', function( projectData ) { 
    var pageCount = projectData.pages.length;
    if (pageCount >= minPages) {
       testElements(projectData.pages,projectMeta);
       // @todo - remove daisy chain. create test fx to call both tests.
    }
  });
}

function testElements(pages,projectMeta) {
    var elements = 0;
    $.each( pages, function( key, val ) {
      elements += val.elements.length;
    });
    if (elements >= minElements) { 
      displayCount += 1;       
      renderProject(projectMeta);
    }
}

function markAsOpened(id){
    $('#' + id).addClass('viewed');
    openedProjects.push(id);
    var openedStr = openedProjects.join();
    localStorage.setItem("openedProjects", openedStr);
    // console.log(openedProjects,openedStr,localStorage.openedProjects);
    // @todo retrieve list on load. apply class.  
}

function clearProjects(){
  $('#app .project').not('.loadUtility').remove();
  setDefaultCounts();
}


function fetchProjects () {
    $('#loading').show();
    $.getJSON( 'https://api.webmaker.org/projects?count=' + queryCount + '&page=' + listPage, function( data ) {
      $.each( data.projects, function( key, val ) {
        fetchCount += 1;
        var remix = val.remixed_from; 
        if (!remix) { 
          testPages(key,val.user_id,val.id,val);
        }      });
      $('#loading').hide();
    }).done( function(){
      console.log('fetched page', listPage);
      listPage += 1;
      renderStats();  
    });
}

$('#loadMore').on('click', function(){
  fetchProjects();
});

$('#app').on('click', '.project', function(){
  markAsOpened(this.id);
});

$('#setPageMin').change(function(){
  minPages = $(this).val();
  clearProjects();
  fetchProjects();
});

$('#setElementMin').change(function(){
  minElements = $(this).val();
  clearProjects();
  fetchProjects();
});


setDefaultCounts();
fetchProjects();
