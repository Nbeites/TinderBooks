let outputList = [];
let dataFrame = [];
let auxData = new Book();
let bookUrl = "https://www.googleapis.com/books/v1/volumes?q=";
let databaseUrl = "https://upacademytinder.herokuapp.com/api/";
let api_key = "AIzaSyDYa9L3MZeWkM4fs44LjQ0qpaDx3p6jOoU";
let likedArray = [];
let dislikedArray = [];
let buttonCounter = 0;
let queryCounter = 0;
let checkBook = false;
let truncatedDescription = '';
let matchedUsers = [];
let booksIds = [];
let booksTitle = [];
let randomSearch = Math.floor(Math.random() * 10);
let matches = {};
let usersMatch = [];

$(document).ready(function () {

    showSearch();
    $("#searchWindow").addClass('d-none');
    //$("#donateDiv").addClass('d-none');

})

// Vai buscar a informacao consoante a informacao introduzida
function getDataFromAPI() {

    $("#searchWindow").removeClass('d-none');

    $("#resultBody").html(``);
    let searchData = $("#searchField").val();
    // Handle Empty field
    if (searchData === "" || searchData === null) {
        alert("Please Search For Something");
    }
    else {
        getBooks(searchData, 0);
    }
    // Inicializa o primeiro livro
    //updateCurrentBook('0');

}

// Vai buscar a informacao random
function getRandomDataFromAPI(searchData) {

    $("#searchWindow").removeClass('d-none');

    let searchFieldValue = $("#searchField").val();
    $("#resultBody").html(``);
    if (searchFieldValue == null || searchFieldValue == "") {
        getBooks(randomSearch, 0);
    }
    else {
        alert("If You Feel Lucky, Don't Search For It");
    }
    // Inicializa o primeiro livro
    //updateCurrentBook('0');

}

function getBooks(searchData, startIndex) {

    let maxResults = 10;

    $.ajax({
        url: bookUrl + searchData + "&maxResults=" + maxResults + "&startIndex=" + startIndex, // + "&key=" + api_key,  //isto pelos vistos nao é preciso
        method: 'GET',
        //   dataType: "json",
        //   data: result,
        success: function (result) {
            console.log(result.items);
            outputList = [];
            for (res in result.items) {
                outputList.push(result.items[res]);
            }
            console.log(outputList);
            getDataFrame();
        },
        error: function () {
            alert("Something Went Wrong");
        }
    })
}

function callMoreBooks() {

    queryCounter += 10;
    buttonCounter = 0;

    let searchData = $("#searchField").val();

    dataFrame = [];
    outputList = [];

    if (searchData === "" || searchData === null) {
        getBooks("book", queryCounter);
    }
    else {
        getBooks(searchData, queryCounter);
    }

}

//O dataFrame é o Array de livros só com as informacoes necessárias
function getDataFrame() {

    for (i in outputList) {

        auxData.title = outputList[i].volumeInfo.title;
        auxData.authors = outputList[i].volumeInfo.authors;
        auxData.description = outputList[i].volumeInfo.description;
        auxData.bookId = outputList[i].id;
        auxData.preview = outputList[i].volumeInfo.previewLink;
        auxData.info = outputList[i].volumeInfo.infoLink;

        if (outputList[i].volumeInfo.imageLinks != null) {
            auxData.thumbnail = outputList[i].volumeInfo.imageLinks.smallThumbnail;
        }

        if (outputList[i].id != null) {
            auxData.bookId = outputList[i].id;
        }

        // debugger
        dataFrame.push(auxData);
        //console.log(dataFrame[i]);
        //updateCurrentBook(0);
        auxData = new Book();
    }
    // dá update ao primeiro book logo quando vai buscar os livros
    updateCurrentBook(buttonCounter);
}

function updateCurrentBook(index) {

    if (dataFrame[0] != null) {

        //Handle empty parameters

        /*                 if (dataFrame[index].id != null) {
                            let id = dataFrame[index].id;
                        }else{
                            let id = noId;
                        } 
                        if (dataFrame[index].thumbnail != null) {
                            let thumbnail = dataFrame[index].thumbnail;
                        }else{
                            let thumbnail = noThumbnail;
                        }  */

        let id = dataFrame[index].bookid;
        let title = dataFrame[index].title;
        let authors = dataFrame[index].authors;
        let description = dataFrame[index].description;
        let thumbnail = dataFrame[index].thumbnail;
        let preview = dataFrame[index].preview;
        let info = dataFrame[index].info;

        if (description == null) {
            description = 'Sorry, this Book has no Description';
            truncatedDescription = description;
            $("#bookDescription").html(`${truncatedDescription}`);
        } else {
            truncatedDescription = truncate(description, 250, '<strong>  (... See Full Description in Info Link</strong>');
            infoLink = "<strong><a href=" + info + ">HERE</a></strong>";
            $("#bookDescription").html(`${truncatedDescription} -> ${infoLink}<strong>)</strong>`);
        }

        $("#previewButton").attr("href", preview);
        $("#infoButton").attr("href", info);
        $("#thumbnail").attr("src", thumbnail);
        $("#bookTitle").html(`${title}`);

        console.log('Actualizei');
        truncatedDescription = '';

        // check if book exists, foi posto aqui porque se fosse no botao de like corria mais devagar que a funcao toda do botao
        checkIfBookExists(dataFrame[index]);
    }

}
// As funcoes likeButton e dislikeButton podem estar numa só, variando apenas o true e false quando se chama a funcao no onclick()  do botao

function likeButton() {

    if (dataFrame != null) {
        buttonCounter++;

        updateCurrentBook(buttonCounter);

        console.log(buttonCounter);

        let currentBook = dataFrame[buttonCounter - 1];
        currentBook.like = true;
        // Faz push para o array de liked do livro actual se nao estiver repetido no array


        if (checkBook == false) {
            likedArray.push(currentBook);
            insertBookInUser(currentBook);
            //Reset Flag
        }

        if (buttonCounter == 9) {
            callMoreBooks();
        }
    }
    checkBook = false;
}

function dislikeButton() {

    if (dataFrame != null) {

        buttonCounter++;

        updateCurrentBook(buttonCounter);
        let currentBook = dataFrame[buttonCounter - 1];
        currentBook.like = false;
        // Faz push para o array de disliked do livro actual se nao estiver repetido no array


        if (checkBook == false) {
            dislikedArray.push(currentBook);
            insertBookInUser(currentBook);
            //Reset Flag

        }

        if (buttonCounter == 9) {
            callMoreBooks();
        }
    }
    checkBook = false;
}

// $.get('https://upacademytinder.herokuapp.com/api/users/?filter={"where":{"username":"' + username + '"},"include":"books"}')
function insertBookInUser(book) {

    console.log(book);

    $.ajax({
        // este currentUser.id foi definido pelo manuel no template que fez ao fazer login, consultar!

        url: databaseUrl + "users/" + currentUser.id + "/books",
        method: 'POST',
        data: book,

        success: function (result) {
            console.log(result);
        },
        error: function () {
            alert("Something Went Wrong");
        }
    })
}

function updateTable(result) {

    $("#resultBody").html(``);

    for (i in result) {
        if (result[i].like == 'true') {
            $("#resultBody").append(`
            <tr class="align-middle">
                <td scope="col"><button id= "${result[i].id}" type="button" class="btn btn-danger" onclick="deleteBook('${result[i].id}')">Delete</button></td>
                <td scope="col"><img width="60px" height="80px" id="thumbnail" src="${result[i].thumbnail}" class="img-thumbnail text-center"
                alt="..."></td>
                <td scope="col">${result[i].title}</td>
                <td scope="col">See Description in Info Link</td>
                <td scope="col"><a href="${result[i].preview}">Preview</a></td>
                <td scope="col"><a href="${result[i].info}">Info</a></td>
            </tr>
    `)
        }
    }
}

function truncate(str, length, ending) {

    if (length == null) {
        length = 100;
    }
    if (ending == null) {
        ending = '...';
    }
    if (str.length > length) {
        return str.substring(0, length - ending.length) + ending;
    } else {
        return str;
    }
}

function eraseBooks() {

    $.ajax({
        url: databaseUrl + "users/" + currentUser.id + "/books",
        method: 'DELETE',
        //   dataType: "json",

        success: function (result) {
            console.log('All Items Deleted');

            $("#resultHead").html(``);
            $("#resultBody").html(``);

        },
        error: function () {
            alert("Something Went Wrong");
        }
    })

}

function checkIfBookExists(book) {

    $.ajax({
        // este currentUser.id foi definido pelo manuel no template que fez ao fazer login, consultar!

        url: databaseUrl + "users/" + currentUser.id + "/books",
        method: 'GET',

        success: function (result) {

            for (i in result) {
                if (result[i].bookId == book.bookId) {
                    checkBook = true;
                    console.log('Repetido!!!')
                }
            }
        },
        error: function () {
            alert("Something Went Wrong");
        }
    })

}

function deleteBook(bookIdDatabase) {

    $.ajax({
        // este currentUser.id foi definido pelo manuel no template que fez ao fazer login, consultar!

        url: databaseUrl + "users/" + currentUser.id + "/books/" + bookIdDatabase,
        method: 'DELETE',

        success: function () {
            console.log('Livro Eliminado');
            getBooksByUser('true');
        },
        error: function () {
            alert("Something Went Wrong");
        }

    })
}

// As funcoes relacionadas com os matches do utilizadores (principalmente a getUsersById() ) tem de ser muito melhoradas
// funcoes muito extensas e confusas

// encontra matches consoante o id dos livros que o current user tem
function findMatch() {

    $("matchesById").addClass('d-none');
    $("matchesById").html(``);
    $("#resultHead").html(``);
    $("#resultBody").html(``);

    getBooksByUser('false'); // o false é para nao dar update na tabela

    setTimeout(processMatch(), 2000);

    $("matchesById").addClass('d-none');

}

function getBooksByUser(updateStatus) {

    booksIds = [];
    booksTitle = [];

    $.ajax({
        // este currentUser.id foi definido pelo manuel no template que fez ao fazer login, consultar!

        url: databaseUrl + "users/" + currentUser.id + "/books",
        method: 'GET',

        success: function (result) {

            for (i in result) {
                if (result[i].like == 'true') {
                    console.log(result[i]);
                    booksIds.push(result[i].bookId);
                    booksTitle.push(result[i].title);
                }
            }

            if (updateStatus == 'true') {
                $("#resultHead").html(``);
                $("#resultHead").append(`
                <th scope="col">Delete</th>
                <th scope="col">Image</th>
                <th scope="col">Title</th>
                <th scope="col">Description</th>
                <th scope="col">Preview</th>
                <th scope="col">Info</th>`
                )
                updateTable(result);
            }

        },
        error: function () {
            alert("Something Went Wrong");
        }
    })

    // este link comentado abaixo é para ir buscar os livros do user que se ponha e nao só do logado no momento
    //  url: databaseUrl + "users/?filter=" + "'where':{'username':" + currentUser.id + "}" + ",'include':'books'}",
}

// vai encontrar o nome do user pelo id e dá print aos matches (Esta funcao precisa mesmo de ser restruturada)
function getUsersById() {
    let pct = 0;
    let counter = 0;
    for (let index = 0; index < usersMatch.length; index++) {
        $.ajax({
            // este currentUser.id foi definido pelo manuel no template que fez ao fazer login, consultar!

            url: databaseUrl + "users/" + usersMatch[index],
            method: 'GET',

            success: function (result) {

                //if (usersMatch[index] != currentUser.id) {
                if (matches.hasOwnProperty(result.username)) {
                    // Incrementa o value 1 2 etc na key username
                    // esta notacao do matches[] é para ficar dinamico, como se fosse para popular um array
                    matches[result.username]++;
                } else {
                    // No caso de nao haver nenhum 
                    matches[result.username] = 1;
                }
                console.log(matches);

                counter++;

                if (counter == usersMatch.length) {
                    console.log(
                        'entrei'
                    );
                            // Criar um objecto ordenado em funcao dos matches
                    var ordered = {};
                    Object.entries(matches).sort((a,b) => b[1]-a[1])
                        .forEach(function(key) {
                           // console.log(key);
                          //  console.log(key[0]);
                           // console.log(matches[key[0]]);
                            
                            
                      ordered[key[0]] = matches[key[0]];
                    });

                    console.log(ordered);
                    $("#showMatch").html(``);
                    $("#matchStatus").html(`Your Matches Below`);

                    pct = 0;
                    for (m = 0; m < Object.keys(ordered).length; m++) {

                        // Nao faz append se o user que esta a dar match for o mesmo do currentUser
                        if (Object.keys(ordered)[m] != currentUser.username) {

                            pct = Math.floor(((Object.values(ordered)[m]) / booksIds.length) * 100);

                            $("#showMatch").append(`<strong class="text-centered"><a class="text-centered">${Object.keys(ordered)[m]}</strong>  : ${Object.values(ordered)[m]} Livros  (${pct}%)</a>
                            <p class="invisible"></p>`);
                            /*                             $("#orderedById").append(`<strong> Match: </strong> <p>${Object.keys(ordered)[m]} : ${Object.values(ordered)[m]} Livros  (${pct}%)</p>
                                                                <p class="invisible"></p>`); */
                            let string = $("#showMatch").val();
                        }
                    }
                    if (Object.keys(ordered).length == 1) {
                        $("#showMatch").html(`No Matches ... Sorry`);
                    }
                }
            },
            error: function () {
                //   alert("Something Went Wrong");
                console.log('Erro ao Procurar')
                counter++;
            }
        })
    }
}

function processMatch() {
    // Este setTimeout é para dar delay a esta funçao porque para o processMatch conseguir correr
    // dentro do findMatch precisa dos valores do booksTitle dado pela funçao getBooksByUser.
    setTimeout(function () {

        matches = {};

        let searchString = "bookId";
        let values = booksIds;
        let counter = 0;

        for (index in values) {
            usersMatch = [];
            $.ajax({
                // este currentUser.id foi definido pelo Manuel no template que fez ao fazer login, consultar!
                // url: databaseUrl + "books/?filter=" + "{"where":{"something":"value"}}, (Tem a ver com a API em questao, forma de enviar dados)

                url: `${databaseUrl}books/?filter={"where":{"${searchString}":"${values[index]}"}}`,
                method: 'GET',
                success: function (result) {

                    console.log(result);
                    $("#matchesById").html(``);
                    for (let i in result) {

                        // Como se está a chamar uma funcao assincrona, tem que se fazer uma condicao
                        // para a funcao só correr a parte do append no caso de ser a ultima iteracao
                        usersMatch.push(result[i].userId);
                        //   getUsersById(result[i].userId, (i==result.length-1));
                    }
                    console.log(counter == values.length - 1);
                    if ((counter == values.length - 1)) {
                        console.log(usersMatch);
                        getUsersById();
                    }
                    counter++;
                    // o object.keys serve para saber as keys do objecto, e o length para saber o comprimento do output do objectkeys
                },
                error: function () {
                    alert("Something Went Wrong");
                }
            })
        }
    }, 200)
}

//Nestas funcoes de showProfile, showSearch e donateTab, existem alguns addClass, removeClass e collapses
// que pode ser optimizados, pois podem estar alguns a mais
function showProfile() {

    //$("#collapseOne").attr('aria-expanded', "false");

    $("#collapseOne").addClass('collapse show');

    $("matchesById").addClass('d-none');
    $("#resultHead").html(``);
    $("#resultBody").html(``);

    $("#searchWindow").addClass('d-none');
    $("#tableWindow").removeClass('d-none');
    $("#collapseOne").addClass('d-none');
    // $('.collapseOne').collapse();
    $("#donateDiv").addClass('d-none');




}

function showSearch() {

    $("#collapseOne").attr('aria-expanded', "true");
    $("#searchWindow").addClass('d-none');
    $("#tableWindow").addClass('d-none');
    $("#collapseOne").removeClass('d-none');
    $('.collapse').collapse("hide");
    $("#donateDiv").addClass('d-none');

    // let isCollapsed = $("#collapseOne").hasClass("");

    // $("#collapseOne").attr('class','collapse show');

}

function donateTab() {


    $("#collapseOne").addClass('collapse show');
    $("#donateDiv").removeClass('d-none');
    $("#resultHead").html(``);
    $("#resultBody").html(``);
    $("#collapseOne").addClass('d-none');
    $("#searchWindow").addClass('d-none');
    $("#tableWindow").addClass('d-none');

    $("#donateButton").html(`<form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top">
    <input type="hidden" name="cmd" value="_s-xclick" />
    <input type="hidden" name="hosted_button_id" value="4ZK368348VXWC" />
    <input type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif" border="0" name="submit" title="PayPal - The safer, easier way to pay online!" alt="Donate with PayPal button" />
    <img alt="" border="0" src="https://www.paypal.com/en_PT/i/scr/pixel.gif" width="1" height="1" />
    </form>`);

}

function deleteMatch() {
    $("#showMatch").html(`Wait a Sec . . .`);
}

