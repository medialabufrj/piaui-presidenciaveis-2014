
// DATASETS

var data_candidatos = [],
	data_eventos    = [],
	data_categorias = [],
	data_regioes    = ["Norte","Nordeste","Centro-oeste","Sudeste","Sul"],
	data_estados    = [

	{uf: "ac", regiao: 0},
	{uf: "am", regiao: 0},
	{uf: "ap", regiao: 0},
	{uf: "pa", regiao: 0},
	{uf: "rr", regiao: 0},
	{uf: "ro", regiao: 0},
	{uf: "to", regiao: 0},

	{uf: "ma", regiao: 1},
	{uf: "pi", regiao: 1},
	{uf: "ce", regiao: 1},
	{uf: "ba", regiao: 1},
	{uf: "rn", regiao: 1},
	{uf: "pb", regiao: 1},
	{uf: "pe", regiao: 1},
	{uf: "al", regiao: 1},
	{uf: "se", regiao: 1},

	{uf: "mt", regiao: 2},
	{uf: "go", regiao: 2},
	{uf: "ms", regiao: 2},
	{uf: "df", regiao: 2},

	{uf: "es", regiao: 3},
	{uf: "mg", regiao: 3},
	{uf: "rj", regiao: 3},
	{uf: "sp", regiao: 3},

	{uf: "pr", regiao: 4},
	{uf: "sc", regiao: 4},
	{uf: "rs", regiao: 4}

];


// PROCESSAMENTO DE DADOS

d3.csv("data.csv")
	.row(function(d){
		// alimenta array candidatos
		if(data_candidatos.indexOf(d.candidato) == -1){
			data_candidatos.push(d.candidato);
		}
		// alimenta array categorias
		if(data_categorias.indexOf(d.categoria) == -1){
			data_categorias.push(d.categoria);
		}
		// retorna obj completo
		return d;
	})
	.get(function(error, rows){
		// alimenta array eventos
		data_eventos = rows;
	});



// INICIA GRAFOS


