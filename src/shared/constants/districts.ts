interface District {
	cod_dis: string
	nom_dis: string
	centroid: {
		lat: number
		lng: number
	}
	barrios: Neighborhood[]
}

interface Neighborhood {
	cod_barrio: string
	num_bar: string
	nom_bar: string
	centroid: {
		lat: number
		lng: number
	}
}

export const DISTRICTS: District[] = [
	{
		cod_dis: '1',
		nom_dis: 'CENTRO',
		centroid: { lat: 40.4168, lng: -3.7038 },
		barrios: [
			{
				cod_barrio: '11',
				num_bar: '1',
				nom_bar: 'PALACIO',
				centroid: { lat: 40.4178, lng: -3.7138 },
			},
			{
				cod_barrio: '12',
				num_bar: '2',
				nom_bar: 'EMBAJADORES',
				centroid: { lat: 40.4058, lng: -3.6938 },
			},
			{
				cod_barrio: '13',
				num_bar: '3',
				nom_bar: 'CORTES',
				centroid: { lat: 40.4158, lng: -3.6838 },
			},
			{
				cod_barrio: '14',
				num_bar: '4',
				nom_bar: 'JUSTICIA',
				centroid: { lat: 40.4258, lng: -3.6738 },
			},
			{
				cod_barrio: '15',
				num_bar: '5',
				nom_bar: 'UNIVERSIDAD',
				centroid: { lat: 40.4358, lng: -3.6638 },
			},
			{
				cod_barrio: '16',
				num_bar: '8',
				nom_bar: 'SOL',
				centroid: { lat: 40.4168, lng: -3.7038 },
			},
		],
	},
	{
		cod_dis: '2',
		nom_dis: 'ARGANZUELA',
		centroid: { lat: 40.3986, lng: -3.6969 },
		barrios: [
			{
				cod_barrio: '21',
				num_bar: '1',
				nom_bar: 'IMPERIAL',
				centroid: { lat: 40.4086, lng: -3.7069 },
			},
			{
				cod_barrio: '22',
				num_bar: '2',
				nom_bar: 'ACACIAS',
				centroid: { lat: 40.3986, lng: -3.6969 },
			},
			{
				cod_barrio: '23',
				num_bar: '3',
				nom_bar: 'CHOPERA',
				centroid: { lat: 40.3886, lng: -3.6869 },
			},
			{
				cod_barrio: '24',
				num_bar: '4',
				nom_bar: 'LEGAZPI',
				centroid: { lat: 40.3786, lng: -3.6769 },
			},
			{
				cod_barrio: '25',
				num_bar: '5',
				nom_bar: 'DELICIAS',
				centroid: { lat: 40.3686, lng: -3.6669 },
			},
			{
				cod_barrio: '26',
				num_bar: '6',
				nom_bar: 'PALOS DE LA FRONTERA',
				centroid: { lat: 40.3586, lng: -3.6569 },
			},
			{
				cod_barrio: '27',
				num_bar: '7',
				nom_bar: 'ATOCHA',
				centroid: { lat: 40.3486, lng: -3.6469 },
			},
		],
	},
	{
		cod_dis: '3',
		nom_dis: 'RETIRO',
		centroid: { lat: 40.4153, lng: -3.6818 },
		barrios: [
			{
				cod_barrio: '31',
				num_bar: '1',
				nom_bar: 'PACIFICO',
				centroid: { lat: 40.4253, lng: -3.6918 },
			},
			{
				cod_barrio: '32',
				num_bar: '2',
				nom_bar: 'ADELFAS',
				centroid: { lat: 40.4153, lng: -3.6818 },
			},
			{
				cod_barrio: '33',
				num_bar: '3',
				nom_bar: 'ESTRELLA',
				centroid: { lat: 40.4053, lng: -3.6718 },
			},
			{
				cod_barrio: '34',
				num_bar: '4',
				nom_bar: 'IBIZA',
				centroid: { lat: 40.3953, lng: -3.6618 },
			},
			{
				cod_barrio: '35',
				num_bar: '5',
				nom_bar: 'LOS JERONIMOS',
				centroid: { lat: 40.3853, lng: -3.6518 },
			},
			{
				cod_barrio: '36',
				num_bar: '6',
				nom_bar: 'NINO JESUS',
				centroid: { lat: 40.3753, lng: -3.6418 },
			},
		],
	},
	{
		cod_dis: '4',
		nom_dis: 'SALAMANCA',
		centroid: { lat: 40.429, lng: -3.6769 },
		barrios: [
			{
				cod_barrio: '41',
				num_bar: '1',
				nom_bar: 'RECOLETOS',
				centroid: { lat: 40.439, lng: -3.6869 },
			},
			{
				cod_barrio: '42',
				num_bar: '2',
				nom_bar: 'GOYA',
				centroid: { lat: 40.429, lng: -3.6769 },
			},
			{
				cod_barrio: '43',
				num_bar: '3',
				nom_bar: 'FUENTE DEL BERRO',
				centroid: { lat: 40.419, lng: -3.6669 },
			},
			{
				cod_barrio: '44',
				num_bar: '4',
				nom_bar: 'GUINDALERA',
				centroid: { lat: 40.409, lng: -3.6569 },
			},
			{
				cod_barrio: '45',
				num_bar: '5',
				nom_bar: 'LISTA',
				centroid: { lat: 40.399, lng: -3.6469 },
			},
			{
				cod_barrio: '46',
				num_bar: '6',
				nom_bar: 'CASTELLANA',
				centroid: { lat: 40.389, lng: -3.6369 },
			},
		],
	},
	{
		cod_dis: '5',
		nom_dis: 'CHAMARTIN',
		centroid: { lat: 40.4618, lng: -3.6754 },
		barrios: [
			{
				cod_barrio: '51',
				num_bar: '1',
				nom_bar: 'EL VISO',
				centroid: { lat: 40.4718, lng: -3.6854 },
			},
			{
				cod_barrio: '52',
				num_bar: '2',
				nom_bar: 'PROSPERIDAD',
				centroid: { lat: 40.4618, lng: -3.6754 },
			},
			{
				cod_barrio: '53',
				num_bar: '3',
				nom_bar: 'CIUDAD JARDIN',
				centroid: { lat: 40.4518, lng: -3.6654 },
			},
			{
				cod_barrio: '54',
				num_bar: '4',
				nom_bar: 'HISPANOAMERICA',
				centroid: { lat: 40.4418, lng: -3.6554 },
			},
			{
				cod_barrio: '55',
				num_bar: '5',
				nom_bar: 'NUEVA ESPANA',
				centroid: { lat: 40.4318, lng: -3.6454 },
			},
			{
				cod_barrio: '56',
				num_bar: '6',
				nom_bar: 'CASTILLA',
				centroid: { lat: 40.4218, lng: -3.6354 },
			},
		],
	},
	{
		cod_dis: '6',
		nom_dis: 'TETUAN',
		centroid: { lat: 40.4599, lng: -3.6976 },
		barrios: [
			{
				cod_barrio: '61',
				num_bar: '1',
				nom_bar: 'BELLAS VISTAS',
				centroid: { lat: 40.4699, lng: -3.7076 },
			},
			{
				cod_barrio: '62',
				num_bar: '2',
				nom_bar: 'CUATRO CAMINOS',
				centroid: { lat: 40.4599, lng: -3.6976 },
			},
			{
				cod_barrio: '63',
				num_bar: '3',
				nom_bar: 'CASTILLEJOS',
				centroid: { lat: 40.4499, lng: -3.6876 },
			},
			{
				cod_barrio: '64',
				num_bar: '4',
				nom_bar: 'ALMENARA',
				centroid: { lat: 40.4399, lng: -3.6776 },
			},
			{
				cod_barrio: '65',
				num_bar: '5',
				nom_bar: 'VALDEACEDERAS',
				centroid: { lat: 40.4299, lng: -3.6676 },
			},
			{
				cod_barrio: '66',
				num_bar: '6',
				nom_bar: 'BERRUGUETE',
				centroid: { lat: 40.4199, lng: -3.6576 },
			},
		],
	},
	{
		cod_dis: '7',
		nom_dis: 'CHAMBERI',
		centroid: { lat: 40.4349, lng: -3.7038 },
		barrios: [
			{
				cod_barrio: '71',
				num_bar: '1',
				nom_bar: 'GAZTAMBIDE',
				centroid: { lat: 40.4449, lng: -3.7138 },
			},
			{
				cod_barrio: '72',
				num_bar: '2',
				nom_bar: 'ARAPILES',
				centroid: { lat: 40.4349, lng: -3.7038 },
			},
			{
				cod_barrio: '73',
				num_bar: '3',
				nom_bar: 'TRAFALGAR',
				centroid: { lat: 40.4249, lng: -3.6938 },
			},
			{
				cod_barrio: '74',
				num_bar: '4',
				nom_bar: 'ALMAGRO',
				centroid: { lat: 40.4149, lng: -3.6838 },
			},
			{
				cod_barrio: '75',
				num_bar: '5',
				nom_bar: 'RIOS ROSAS',
				centroid: { lat: 40.4049, lng: -3.6738 },
			},
			{
				cod_barrio: '76',
				num_bar: '6',
				nom_bar: 'VALLEHERMOSO',
				centroid: { lat: 40.3949, lng: -3.6638 },
			},
		],
	},
	{
		cod_dis: '8',
		nom_dis: 'FUENCARRAL-EL PARDO',
		centroid: { lat: 40.4876, lng: -3.7153 },
		barrios: [
			{
				cod_barrio: '81',
				num_bar: '1',
				nom_bar: 'EL PARDO',
				centroid: { lat: 40.4976, lng: -3.7253 },
			},
			{
				cod_barrio: '82',
				num_bar: '2',
				nom_bar: 'FUENTELARREINA',
				centroid: { lat: 40.4876, lng: -3.7153 },
			},
			{
				cod_barrio: '83',
				num_bar: '3',
				nom_bar: 'PENAGRANDE',
				centroid: { lat: 40.4776, lng: -3.7053 },
			},
			{
				cod_barrio: '84',
				num_bar: '4',
				nom_bar: 'PILAR',
				centroid: { lat: 40.4676, lng: -3.6953 },
			},
			{
				cod_barrio: '85',
				num_bar: '5',
				nom_bar: 'LA PAZ',
				centroid: { lat: 40.4576, lng: -3.6853 },
			},
			{
				cod_barrio: '86',
				num_bar: '6',
				nom_bar: 'VALVERDE',
				centroid: { lat: 40.4476, lng: -3.6753 },
			},
			{
				cod_barrio: '87',
				num_bar: '7',
				nom_bar: 'MIRASIERRA',
				centroid: { lat: 40.4376, lng: -3.6653 },
			},
			{
				cod_barrio: '88',
				num_bar: '8',
				nom_bar: 'EL GOLOSO',
				centroid: { lat: 40.4276, lng: -3.6553 },
			},
		],
	},
	{
		cod_dis: '9',
		nom_dis: 'MONCLOA-ARAVACA',
		centroid: { lat: 40.435, lng: -3.7319 },
		barrios: [
			{
				cod_barrio: '91',
				num_bar: '1',
				nom_bar: 'CASA DE CAMPO',
				centroid: { lat: 40.445, lng: -3.7419 },
			},
			{
				cod_barrio: '92',
				num_bar: '2',
				nom_bar: 'ARGUELLES',
				centroid: { lat: 40.435, lng: -3.7319 },
			},
			{
				cod_barrio: '93',
				num_bar: '3',
				nom_bar: 'CIUDAD UNIVERSITARIA',
				centroid: { lat: 40.425, lng: -3.7219 },
			},
			{
				cod_barrio: '94',
				num_bar: '4',
				nom_bar: 'VALDEZARZA',
				centroid: { lat: 40.415, lng: -3.7119 },
			},
			{
				cod_barrio: '95',
				num_bar: '5',
				nom_bar: 'VALDEMARIN',
				centroid: { lat: 40.405, lng: -3.7019 },
			},
			{
				cod_barrio: '96',
				num_bar: '6',
				nom_bar: 'EL PLANTIO',
				centroid: { lat: 40.395, lng: -3.6919 },
			},
			{
				cod_barrio: '97',
				num_bar: '7',
				nom_bar: 'ARAVACA',
				centroid: { lat: 40.385, lng: -3.6819 },
			},
		],
	},
	{
		cod_dis: '10',
		nom_dis: 'LATINA',
		centroid: { lat: 40.3888, lng: -3.7444 },
		barrios: [
			{
				cod_barrio: '101',
				num_bar: '1',
				nom_bar: 'LOS CARMENES',
				centroid: { lat: 40.3988, lng: -3.7544 },
			},
			{
				cod_barrio: '102',
				num_bar: '2',
				nom_bar: 'PUERTA DEL ANGEL',
				centroid: { lat: 40.3888, lng: -3.7444 },
			},
			{
				cod_barrio: '103',
				num_bar: '3',
				nom_bar: 'LUCERO',
				centroid: { lat: 40.3788, lng: -3.7344 },
			},
			{
				cod_barrio: '104',
				num_bar: '4',
				nom_bar: 'ALUCHE',
				centroid: { lat: 40.3688, lng: -3.7244 },
			},
			{
				cod_barrio: '105',
				num_bar: '5',
				nom_bar: 'CAMPAMENTO',
				centroid: { lat: 40.3588, lng: -3.7144 },
			},
			{
				cod_barrio: '106',
				num_bar: '6',
				nom_bar: 'CUATRO VIENTOS',
				centroid: { lat: 40.3488, lng: -3.7044 },
			},
			{
				cod_barrio: '107',
				num_bar: '7',
				nom_bar: 'AGUILAS',
				centroid: { lat: 40.3388, lng: -3.6944 },
			},
		],
	},
	{
		cod_dis: '11',
		nom_dis: 'CARABANCHEL',
		centroid: { lat: 40.3859, lng: -3.7234 },
		barrios: [
			{
				cod_barrio: '111',
				num_bar: '1',
				nom_bar: 'COMILLAS',
				centroid: { lat: 40.3959, lng: -3.7334 },
			},
			{
				cod_barrio: '112',
				num_bar: '2',
				nom_bar: 'OPANEL',
				centroid: { lat: 40.3859, lng: -3.7234 },
			},
			{
				cod_barrio: '113',
				num_bar: '3',
				nom_bar: 'SAN ISIDRO',
				centroid: { lat: 40.3759, lng: -3.7134 },
			},
			{
				cod_barrio: '114',
				num_bar: '4',
				nom_bar: 'VISTA ALEGRE',
				centroid: { lat: 40.3659, lng: -3.7034 },
			},
			{
				cod_barrio: '115',
				num_bar: '5',
				nom_bar: 'PUERTA BONITA',
				centroid: { lat: 40.3559, lng: -3.6934 },
			},
			{
				cod_barrio: '116',
				num_bar: '6',
				nom_bar: 'BUENAVISTA',
				centroid: { lat: 40.3459, lng: -3.6834 },
			},
			{
				cod_barrio: '117',
				num_bar: '7',
				nom_bar: 'ABRANTES',
				centroid: { lat: 40.3359, lng: -3.6734 },
			},
		],
	},
	{
		cod_dis: '12',
		nom_dis: 'USERA',
		centroid: { lat: 40.3855, lng: -3.7056 },
		barrios: [
			{
				cod_barrio: '121',
				num_bar: '1',
				nom_bar: 'ORCASITAS',
				centroid: { lat: 40.3955, lng: -3.7156 },
			},
			{
				cod_barrio: '122',
				num_bar: '2',
				nom_bar: 'ORCASUR',
				centroid: { lat: 40.3855, lng: -3.7056 },
			},
			{
				cod_barrio: '123',
				num_bar: '3',
				nom_bar: 'SAN FERMIN',
				centroid: { lat: 40.3755, lng: -3.6956 },
			},
			{
				cod_barrio: '124',
				num_bar: '4',
				nom_bar: 'ALMENDRALES',
				centroid: { lat: 40.3655, lng: -3.6856 },
			},
			{
				cod_barrio: '125',
				num_bar: '5',
				nom_bar: 'MOSCARDO',
				centroid: { lat: 40.3555, lng: -3.6756 },
			},
			{
				cod_barrio: '126',
				num_bar: '6',
				nom_bar: 'ZOFIO',
				centroid: { lat: 40.3455, lng: -3.6656 },
			},
			{
				cod_barrio: '127',
				num_bar: '7',
				nom_bar: 'PRADOLONGO',
				centroid: { lat: 40.3355, lng: -3.6556 },
			},
		],
	},
	{
		cod_dis: '13',
		nom_dis: 'PUENTE DE VALLECAS',
		centroid: { lat: 40.3914, lng: -3.6642 },
		barrios: [
			{
				cod_barrio: '131',
				num_bar: '1',
				nom_bar: 'ENTREVIAS',
				centroid: { lat: 40.4014, lng: -3.6742 },
			},
			{
				cod_barrio: '132',
				num_bar: '2',
				nom_bar: 'SAN DIEGO',
				centroid: { lat: 40.3914, lng: -3.6642 },
			},
			{
				cod_barrio: '133',
				num_bar: '3',
				nom_bar: 'PALOMERAS BAJAS',
				centroid: { lat: 40.3814, lng: -3.6542 },
			},
			{
				cod_barrio: '134',
				num_bar: '4',
				nom_bar: 'PALOMERAS SURESTE',
				centroid: { lat: 40.3714, lng: -3.6442 },
			},
			{
				cod_barrio: '135',
				num_bar: '5',
				nom_bar: 'PORTAZGO',
				centroid: { lat: 40.3614, lng: -3.6342 },
			},
			{
				cod_barrio: '136',
				num_bar: '6',
				nom_bar: 'NUMANCIA',
				centroid: { lat: 40.3514, lng: -3.6242 },
			},
		],
	},
	{
		cod_dis: '14',
		nom_dis: 'MORATALAZ',
		centroid: { lat: 40.4089, lng: -3.6394 },
		barrios: [
			{
				cod_barrio: '141',
				num_bar: '1',
				nom_bar: 'PAVONES',
				centroid: { lat: 40.4189, lng: -3.6494 },
			},
			{
				cod_barrio: '142',
				num_bar: '2',
				nom_bar: 'HORCAJO',
				centroid: { lat: 40.4089, lng: -3.6394 },
			},
			{
				cod_barrio: '143',
				num_bar: '3',
				nom_bar: 'MARROQUINA',
				centroid: { lat: 40.3989, lng: -3.6294 },
			},
			{
				cod_barrio: '144',
				num_bar: '4',
				nom_bar: 'MEDIA LEGUA',
				centroid: { lat: 40.3889, lng: -3.6194 },
			},
			{
				cod_barrio: '145',
				num_bar: '5',
				nom_bar: 'FONTARRON',
				centroid: { lat: 40.3789, lng: -3.6094 },
			},
			{
				cod_barrio: '146',
				num_bar: '6',
				nom_bar: 'VINATEROS',
				centroid: { lat: 40.3689, lng: -3.5994 },
			},
		],
	},
	{
		cod_dis: '15',
		nom_dis: 'CIUDAD LINEAL',
		centroid: { lat: 40.4389, lng: -3.6458 },
		barrios: [
			{
				cod_barrio: '151',
				num_bar: '1',
				nom_bar: 'VENTAS',
				centroid: { lat: 40.4489, lng: -3.6558 },
			},
			{
				cod_barrio: '152',
				num_bar: '2',
				nom_bar: 'PUEBLO NUEVO',
				centroid: { lat: 40.4389, lng: -3.6458 },
			},
			{
				cod_barrio: '153',
				num_bar: '3',
				nom_bar: 'QUINTANA',
				centroid: { lat: 40.4289, lng: -3.6358 },
			},
			{
				cod_barrio: '154',
				num_bar: '4',
				nom_bar: 'LA CONCEPCION',
				centroid: { lat: 40.4189, lng: -3.6258 },
			},
			{
				cod_barrio: '155',
				num_bar: '5',
				nom_bar: 'SAN PASCUAL',
				centroid: { lat: 40.4089, lng: -3.6158 },
			},
			{
				cod_barrio: '156',
				num_bar: '6',
				nom_bar: 'SAN JUAN BAUTISTA',
				centroid: { lat: 40.3989, lng: -3.6058 },
			},
			{
				cod_barrio: '157',
				num_bar: '7',
				nom_bar: 'COLINA',
				centroid: { lat: 40.3889, lng: -3.5958 },
			},
			{
				cod_barrio: '158',
				num_bar: '8',
				nom_bar: 'ATALAYA',
				centroid: { lat: 40.3789, lng: -3.5858 },
			},
			{
				cod_barrio: '159',
				num_bar: '9',
				nom_bar: 'COSTILLARES',
				centroid: { lat: 40.3689, lng: -3.5758 },
			},
		],
	},
	{
		cod_dis: '16',
		nom_dis: 'HORTALEZA',
		centroid: { lat: 40.4696, lng: -3.6394 },
		barrios: [
			{
				cod_barrio: '161',
				num_bar: '1',
				nom_bar: 'PALOMAS',
				centroid: { lat: 40.4796, lng: -3.6494 },
			},
			{
				cod_barrio: '162',
				num_bar: '2',
				nom_bar: 'PIOVERA',
				centroid: { lat: 40.4696, lng: -3.6394 },
			},
			{
				cod_barrio: '163',
				num_bar: '3',
				nom_bar: 'CANILLAS',
				centroid: { lat: 40.4596, lng: -3.6294 },
			},
			{
				cod_barrio: '164',
				num_bar: '4',
				nom_bar: 'PINAR DEL REY',
				centroid: { lat: 40.4496, lng: -3.6194 },
			},
			{
				cod_barrio: '165',
				num_bar: '5',
				nom_bar: 'APOSTOL SANTIAGO',
				centroid: { lat: 40.4396, lng: -3.6094 },
			},
			{
				cod_barrio: '166',
				num_bar: '6',
				nom_bar: 'VALDEFUENTES',
				centroid: { lat: 40.4296, lng: -3.5994 },
			},
		],
	},
	{
		cod_dis: '17',
		nom_dis: 'VILLAVERDE',
		centroid: { lat: 40.3519, lng: -3.7056 },
		barrios: [
			{
				cod_barrio: '171',
				num_bar: '1',
				nom_bar: 'VILLAVERDE ALTO - CASCO HISTORICO DE VILLAVERDE',
				centroid: { lat: 40.3619, lng: -3.7156 },
			},
			{
				cod_barrio: '172',
				num_bar: '2',
				nom_bar: 'SAN CRISTOBAL',
				centroid: { lat: 40.3519, lng: -3.7056 },
			},
			{
				cod_barrio: '173',
				num_bar: '3',
				nom_bar: 'BUTARQUE',
				centroid: { lat: 40.3419, lng: -3.6956 },
			},
			{
				cod_barrio: '174',
				num_bar: '4',
				nom_bar: 'LOS ROSALES',
				centroid: { lat: 40.3319, lng: -3.6856 },
			},
			{
				cod_barrio: '175',
				num_bar: '5',
				nom_bar: 'ANGELES',
				centroid: { lat: 40.3219, lng: -3.6756 },
			},
		],
	},
	{
		cod_dis: '18',
		nom_dis: 'VILLA DE VALLECAS',
		centroid: { lat: 40.3519, lng: -3.6231 },
		barrios: [
			{
				cod_barrio: '181',
				num_bar: '1',
				nom_bar: 'CASCO HISTORICO DE VALLECAS',
				centroid: { lat: 40.3619, lng: -3.6331 },
			},
			{
				cod_barrio: '182',
				num_bar: '2',
				nom_bar: 'SANTA EUGENIA',
				centroid: { lat: 40.3519, lng: -3.6231 },
			},
			{
				cod_barrio: '183',
				num_bar: '3',
				nom_bar: 'ENSANCHE DE VALLECAS',
				centroid: { lat: 40.3419, lng: -3.6131 },
			},
		],
	},
	{
		cod_dis: '19',
		nom_dis: 'VICALVARO',
		centroid: { lat: 40.4089, lng: -3.595 },
		barrios: [
			{
				cod_barrio: '191',
				num_bar: '1',
				nom_bar: 'CASCO HISTORICO DE VICALVARO',
				centroid: { lat: 40.4189, lng: -3.605 },
			},
			{
				cod_barrio: '192',
				num_bar: '2',
				nom_bar: 'VALDEBERNARDO',
				centroid: { lat: 40.4089, lng: -3.595 },
			},
			{
				cod_barrio: '193',
				num_bar: '3',
				nom_bar: 'VALDERRIVAS',
				centroid: { lat: 40.3989, lng: -3.585 },
			},
			{
				cod_barrio: '194',
				num_bar: '4',
				nom_bar: 'EL CANAVERAL',
				centroid: { lat: 40.3889, lng: -3.575 },
			},
		],
	},
	{
		cod_dis: '20',
		nom_dis: 'SAN BLAS-CANILLEJAS',
		centroid: { lat: 40.4696, lng: -3.595 },
		barrios: [
			{
				cod_barrio: '201',
				num_bar: '1',
				nom_bar: 'SIMANCAS',
				centroid: { lat: 40.4796, lng: -3.605 },
			},
			{
				cod_barrio: '202',
				num_bar: '2',
				nom_bar: 'HELLIN',
				centroid: { lat: 40.4696, lng: -3.595 },
			},
			{
				cod_barrio: '203',
				num_bar: '3',
				nom_bar: 'AMPOSTA',
				centroid: { lat: 40.4596, lng: -3.585 },
			},
			{
				cod_barrio: '204',
				num_bar: '4',
				nom_bar: 'ARCOS',
				centroid: { lat: 40.4496, lng: -3.575 },
			},
			{
				cod_barrio: '205',
				num_bar: '5',
				nom_bar: 'ROSAS',
				centroid: { lat: 40.4396, lng: -3.565 },
			},
			{
				cod_barrio: '206',
				num_bar: '6',
				nom_bar: 'REJAS',
				centroid: { lat: 40.4296, lng: -3.555 },
			},
			{
				cod_barrio: '207',
				num_bar: '7',
				nom_bar: 'CANILLEJAS',
				centroid: { lat: 40.4196, lng: -3.545 },
			},
			{
				cod_barrio: '208',
				num_bar: '8',
				nom_bar: 'EL SALVADOR',
				centroid: { lat: 40.4096, lng: -3.535 },
			},
		],
	},
	{
		cod_dis: '21',
		nom_dis: 'BARAJAS',
		centroid: { lat: 40.4696, lng: -3.575 },
		barrios: [
			{
				cod_barrio: '211',
				num_bar: '1',
				nom_bar: 'ALAMEDA DE OSUNA',
				centroid: { lat: 40.4796, lng: -3.585 },
			},
			{
				cod_barrio: '212',
				num_bar: '2',
				nom_bar: 'AEROPUERTO',
				centroid: { lat: 40.4696, lng: -3.575 },
			},
			{
				cod_barrio: '213',
				num_bar: '3',
				nom_bar: 'CASCO HISTORICO DE BARAJAS',
				centroid: { lat: 40.4596, lng: -3.565 },
			},
			{
				cod_barrio: '214',
				num_bar: '4',
				nom_bar: 'TIMON',
				centroid: { lat: 40.4496, lng: -3.555 },
			},
			{
				cod_barrio: '215',
				num_bar: '5',
				nom_bar: 'CORRALEJOS',
				centroid: { lat: 40.4396, lng: -3.545 },
			},
		],
	},
]
