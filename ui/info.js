function loadArticles () {
    
    var request = new XMLHttpRequest();
    
    request.onreadystatechange = function () {
        if (request.readyState === XMLHttpRequest.DONE) {
            var articles = document.getElementById('articles');
            if (request.status === 200) {
                var content = '<ul class="list-group">';
                var articleData = JSON.parse(this.responseText);
                for (var i=0; i< articleData.length; i++) {
                 
                 content += `<div class="gart">
                                <li class="list-unstyled list-group-item">

                                        <a class="btn btn-primary list-group-item" href="/articles/${articleData[i].title}">
                                            <h4 class="list-group-item-heading">${articleData[i].heading}</h4>
                                            <p class="list-group-item-text">(${articleData[i].date.split('T')[0]})</p>
                                        </a>
                                        
                                    
                                </li>
                            </div>
                            </br>`;
                 
                 
                }
                content += "</ul>";
                articles.innerHTML = content;
            } else {
               articles.innerHTML('Oops! Could not load all articles!');
            }
        }
    };

    request.open('GET', '/get-articles', true);
    request.send(null);

}


loadArticles();
