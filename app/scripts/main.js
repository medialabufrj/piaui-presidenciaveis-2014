
// DATASETS

var data_regioes    = ["Norte","Nordeste","Centro-oeste","Sudeste","Sul"],
    data_estados    = [

        {uf: "AC", regiao: 0},
        {uf: "AM", regiao: 0},
        {uf: "AP", regiao: 0},
        {uf: "PA", regiao: 0},
        {uf: "RR", regiao: 0},
        {uf: "RO", regiao: 0},
        {uf: "TO", regiao: 0},

        {uf: "MA", regiao: 1},
        {uf: "PI", regiao: 1},
        {uf: "CE", regiao: 1},
        {uf: "BA", regiao: 1},
        {uf: "RN", regiao: 1},
        {uf: "PB", regiao: 1},
        {uf: "PE", regiao: 1},
        {uf: "AL", regiao: 1},
        {uf: "SE", regiao: 1},

        {uf: "MT", regiao: 2},
        {uf: "GO", regiao: 2},
        {uf: "MS", regiao: 2},
        {uf: "DF", regiao: 2},

        {uf: "ES", regiao: 3},
        {uf: "MG", regiao: 3},
        {uf: "RJ", regiao: 3},
        {uf: "SP", regiao: 3},

        {uf: "PR", regiao: 4},
        {uf: "SC", regiao: 4},
        {uf: "RS", regiao: 4}

    ],
    data_candidatos = [],
    data_eventos    = [],
    data_categorias = []
    ;


// PROCESSAMENTO DE DADOS

function loadDataset(arr) {
    var count = 0;
    var callback = function(){
        count++;
        if(count < arr.length)
            loadCSV(arr[count], callback);
    }
    loadCSV(arr[0],callback);
}

function loadCSV(file,callback){

    // DVS para carregar CSV separado por ;

    var dsv = d3.dsv(";", "text/plain");

    dsv(file)
        .row(function(d){
            // alimenta array candidatos
            if(data_candidatos.indexOf(d.CANDIDATO) == -1){
                data_candidatos.push(d.CANDIDATO);
            }
            // alimenta array categorias
            if(data_categorias.indexOf(d.CATEGORIA) == -1){
                data_categorias.push(d.CATEGORIA);
            }
            // adiciona regiao
            d.REGIAO = data_regioes[_.findWhere(data_estados,{uf: d.UF}).regiao];
            // formata a data
            var format = d3.time.format("%d.%m.%Y");
            d.DATA_STRING = d.DATA;
            d.DATA = format.parse(d.DATA);
            // retorna obj completo
            return d;
        })
        .get(function(error, rows){
            // alimenta array eventos
            data_eventos = _.union(rows,data_eventos);
            // log
            console.log('loaded CSV!');
            // chama callback
            if(callback) callback();
        });

    console.log('loading file', file);
}

loadDataset([
    'dados_presidenciaveis_revistapiaui_aecioneves.csv',
    'dados_presidenciaveis_revistapiaui_dilmarousseff.csv',
    'dados_presidenciaveis_revistapiaui_marinasilva.csv'
]);


// INICIA GRAFOS


