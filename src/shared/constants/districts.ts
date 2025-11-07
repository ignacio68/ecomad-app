interface LatLng {
	lat: number
	lng: number
}

interface District {
	district_id: string
	nom_dis: string
	centroid: LatLng
	barrios: Neighborhood[]
}

interface Neighborhood {
	neighborhood_id: string
	num_bar: string
	nom_bar: string
	centroid: LatLng
}

export const DISTRICTS: District[] = [
	{
		district_id: '01',
		nom_dis: 'CENTRO',
		centroid: { lat: 40.4168, lng: -3.7038 },
		barrios: [
			{
				neighborhood_id: '011',
				num_bar: '1',
				nom_bar: 'PALACIO',
				centroid: { lat: 40.4178, lng: -3.7138 },
			},
			{
				neighborhood_id: '012',
				num_bar: '2',
				nom_bar: 'EMBAJADORES',
				centroid: { lat: 40.4058, lng: -3.6938 },
			},
			{
				neighborhood_id: '013',
				num_bar: '3',
				nom_bar: 'CORTES',
				centroid: { lat: 40.4158, lng: -3.6838 },
			},
			{
				neighborhood_id: '014',
				num_bar: '4',
				nom_bar: 'JUSTICIA',
				centroid: { lat: 40.4258, lng: -3.6738 },
			},
			{
				neighborhood_id: '015',
				num_bar: '5',
				nom_bar: 'UNIVERSIDAD',
				centroid: { lat: 40.4358, lng: -3.6638 },
			},
			{
				neighborhood_id: '016',
				num_bar: '8',
				nom_bar: 'SOL',
				centroid: { lat: 40.4168, lng: -3.7038 },
			},
		],
	},
	{
		district_id: '02',
		nom_dis: 'ARGANZUELA',
		centroid: { lat: 40.3986, lng: -3.6969 },
		barrios: [
			{
				neighborhood_id: '021',
				num_bar: '1',
				nom_bar: 'IMPERIAL',
				centroid: { lat: 40.4086, lng: -3.7069 },
			},
			{
				neighborhood_id: '022',
				num_bar: '2',
				nom_bar: 'ACACIAS',
				centroid: { lat: 40.3986, lng: -3.6969 },
			},
			{
				neighborhood_id: '023',
				num_bar: '3',
				nom_bar: 'CHOPERA',
				centroid: { lat: 40.3886, lng: -3.6869 },
			},
			{
				neighborhood_id: '024',
				num_bar: '4',
				nom_bar: 'LEGAZPI',
				centroid: { lat: 40.3786, lng: -3.6769 },
			},
			{
				neighborhood_id: '025',
				num_bar: '5',
				nom_bar: 'DELICIAS',
				centroid: { lat: 40.3686, lng: -3.6669 },
			},
			{
				neighborhood_id: '026',
				num_bar: '6',
				nom_bar: 'PALOS DE LA FRONTERA',
				centroid: { lat: 40.3586, lng: -3.6569 },
			},
			{
				neighborhood_id: '027',
				num_bar: '7',
				nom_bar: 'ATOCHA',
				centroid: { lat: 40.3486, lng: -3.6469 },
			},
		],
	},
	{
		district_id: '03',
		nom_dis: 'RETIRO',
		centroid: { lat: 40.4153, lng: -3.6818 },
		barrios: [
			{
				neighborhood_id: '031',
				num_bar: '1',
				nom_bar: 'PACIFICO',
				centroid: { lat: 40.4253, lng: -3.6918 },
			},
			{
				neighborhood_id: '032',
				num_bar: '2',
				nom_bar: 'ADELFAS',
				centroid: { lat: 40.4153, lng: -3.6818 },
			},
			{
				neighborhood_id: '033',
				num_bar: '3',
				nom_bar: 'ESTRELLA',
				centroid: { lat: 40.4053, lng: -3.6718 },
			},
			{
				neighborhood_id: '034',
				num_bar: '4',
				nom_bar: 'IBIZA',
				centroid: { lat: 40.3953, lng: -3.6618 },
			},
			{
				neighborhood_id: '035',
				num_bar: '5',
				nom_bar: 'LOS JERONIMOS',
				centroid: { lat: 40.3853, lng: -3.6518 },
			},
			{
				neighborhood_id: '036',
				num_bar: '6',
				nom_bar: 'NINO JESUS',
				centroid: { lat: 40.3753, lng: -3.6418 },
			},
		],
	},
	{
		district_id: '04',
		nom_dis: 'SALAMANCA',
		centroid: { lat: 40.429, lng: -3.6769 },
		barrios: [
			{
				neighborhood_id: '041',
				num_bar: '1',
				nom_bar: 'RECOLETOS',
				centroid: { lat: 40.439, lng: -3.6869 },
			},
			{
				neighborhood_id: '042',
				num_bar: '2',
				nom_bar: 'GOYA',
				centroid: { lat: 40.429, lng: -3.6769 },
			},
			{
				neighborhood_id: '043',
				num_bar: '3',
				nom_bar: 'FUENTE DEL BERRO',
				centroid: { lat: 40.419, lng: -3.6669 },
			},
			{
				neighborhood_id: '044',
				num_bar: '4',
				nom_bar: 'GUINDALERA',
				centroid: { lat: 40.409, lng: -3.6569 },
			},
			{
				neighborhood_id: '045',
				num_bar: '5',
				nom_bar: 'LISTA',
				centroid: { lat: 40.399, lng: -3.6469 },
			},
			{
				neighborhood_id: '046',
				num_bar: '6',
				nom_bar: 'CASTELLANA',
				centroid: { lat: 40.389, lng: -3.6369 },
			},
		],
	},
	{
		district_id: '05',
		nom_dis: 'CHAMARTIN',
		centroid: { lat: 40.4618, lng: -3.6754 },
		barrios: [
			{
				neighborhood_id: '051',
				num_bar: '1',
				nom_bar: 'EL VISO',
				centroid: { lat: 40.4718, lng: -3.6854 },
			},
			{
				neighborhood_id: '052',
				num_bar: '2',
				nom_bar: 'PROSPERIDAD',
				centroid: { lat: 40.4618, lng: -3.6754 },
			},
			{
				neighborhood_id: '053',
				num_bar: '3',
				nom_bar: 'CIUDAD JARDIN',
				centroid: { lat: 40.4518, lng: -3.6654 },
			},
			{
				neighborhood_id: '054',
				num_bar: '4',
				nom_bar: 'HISPANOAMERICA',
				centroid: { lat: 40.4418, lng: -3.6554 },
			},
			{
				neighborhood_id: '055',
				num_bar: '5',
				nom_bar: 'NUEVA ESPANA',
				centroid: { lat: 40.4318, lng: -3.6454 },
			},
			{
				neighborhood_id: '056',
				num_bar: '6',
				nom_bar: 'CASTILLA',
				centroid: { lat: 40.4218, lng: -3.6354 },
			},
		],
	},
	{
		district_id: '06',
		nom_dis: 'TETUAN',
		centroid: { lat: 40.4599, lng: -3.6976 },
		barrios: [
			{
				neighborhood_id: '061',
				num_bar: '1',
				nom_bar: 'BELLAS VISTAS',
				centroid: { lat: 40.4699, lng: -3.7076 },
			},
			{
				neighborhood_id: '062',
				num_bar: '2',
				nom_bar: 'CUATRO CAMINOS',
				centroid: { lat: 40.4599, lng: -3.6976 },
			},
			{
				neighborhood_id: '063',
				num_bar: '3',
				nom_bar: 'CASTILLEJOS',
				centroid: { lat: 40.4499, lng: -3.6876 },
			},
			{
				neighborhood_id: '064',
				num_bar: '4',
				nom_bar: 'ALMENARA',
				centroid: { lat: 40.4399, lng: -3.6776 },
			},
			{
				neighborhood_id: '065',
				num_bar: '5',
				nom_bar: 'VALDEACEDERAS',
				centroid: { lat: 40.4299, lng: -3.6676 },
			},
			{
				neighborhood_id: '066',
				num_bar: '6',
				nom_bar: 'BERRUGUETE',
				centroid: { lat: 40.4199, lng: -3.6576 },
			},
		],
	},
	{
		district_id: '07',
		nom_dis: 'CHAMBERI',
		centroid: { lat: 40.4349, lng: -3.7038 },
		barrios: [
			{
				neighborhood_id: '071',
				num_bar: '1',
				nom_bar: 'GAZTAMBIDE',
				centroid: { lat: 40.4449, lng: -3.7138 },
			},
			{
				neighborhood_id: '072',
				num_bar: '2',
				nom_bar: 'ARAPILES',
				centroid: { lat: 40.4349, lng: -3.7038 },
			},
			{
				neighborhood_id: '073',
				num_bar: '3',
				nom_bar: 'TRAFALGAR',
				centroid: { lat: 40.4249, lng: -3.6938 },
			},
			{
				neighborhood_id: '074',
				num_bar: '4',
				nom_bar: 'ALMAGRO',
				centroid: { lat: 40.4149, lng: -3.6838 },
			},
			{
				neighborhood_id: '075',
				num_bar: '5',
				nom_bar: 'RIOS ROSAS',
				centroid: { lat: 40.4049, lng: -3.6738 },
			},
			{
				neighborhood_id: '076',
				num_bar: '6',
				nom_bar: 'VALLEHERMOSO',
				centroid: { lat: 40.3949, lng: -3.6638 },
			},
		],
	},
	{
		district_id: '08',
		nom_dis: 'FUENCARRAL-EL PARDO',
		centroid: { lat: 40.4876, lng: -3.7153 },
		barrios: [
			{
				neighborhood_id: '081',
				num_bar: '1',
				nom_bar: 'EL PARDO',
				centroid: { lat: 40.4976, lng: -3.7253 },
			},
			{
				neighborhood_id: '082',
				num_bar: '2',
				nom_bar: 'FUENTELARREINA',
				centroid: { lat: 40.4876, lng: -3.7153 },
			},
			{
				neighborhood_id: '083',
				num_bar: '3',
				nom_bar: 'PENAGRANDE',
				centroid: { lat: 40.4776, lng: -3.7053 },
			},
			{
				neighborhood_id: '084',
				num_bar: '4',
				nom_bar: 'PILAR',
				centroid: { lat: 40.4676, lng: -3.6953 },
			},
			{
				neighborhood_id: '085',
				num_bar: '5',
				nom_bar: 'LA PAZ',
				centroid: { lat: 40.4576, lng: -3.6853 },
			},
			{
				neighborhood_id: '086',
				num_bar: '6',
				nom_bar: 'VALVERDE',
				centroid: { lat: 40.4476, lng: -3.6753 },
			},
			{
				neighborhood_id: '087',
				num_bar: '7',
				nom_bar: 'MIRASIERRA',
				centroid: { lat: 40.4376, lng: -3.6653 },
			},
			{
				neighborhood_id: '088',
				num_bar: '8',
				nom_bar: 'EL GOLOSO',
				centroid: { lat: 40.4276, lng: -3.6553 },
			},
		],
	},
	{
		district_id: '09',
		nom_dis: 'MONCLOA-ARAVACA',
		centroid: { lat: 40.435, lng: -3.7319 },
		barrios: [
			{
				neighborhood_id: '091',
				num_bar: '1',
				nom_bar: 'CASA DE CAMPO',
				centroid: { lat: 40.445, lng: -3.7419 },
			},
			{
				neighborhood_id: '092',
				num_bar: '2',
				nom_bar: 'ARGUELLES',
				centroid: { lat: 40.435, lng: -3.7319 },
			},
			{
				neighborhood_id: '093',
				num_bar: '3',
				nom_bar: 'CIUDAD UNIVERSITARIA',
				centroid: { lat: 40.425, lng: -3.7219 },
			},
			{
				neighborhood_id: '094',
				num_bar: '4',
				nom_bar: 'VALDEZARZA',
				centroid: { lat: 40.415, lng: -3.7119 },
			},
			{
				neighborhood_id: '095',
				num_bar: '5',
				nom_bar: 'VALDEMARIN',
				centroid: { lat: 40.405, lng: -3.7019 },
			},
			{
				neighborhood_id: '096',
				num_bar: '6',
				nom_bar: 'EL PLANTIO',
				centroid: { lat: 40.395, lng: -3.6919 },
			},
			{
				neighborhood_id: '097',
				num_bar: '7',
				nom_bar: 'ARAVACA',
				centroid: { lat: 40.385, lng: -3.6819 },
			},
		],
	},
	{
		district_id: '10',
		nom_dis: 'LATINA',
		centroid: { lat: 40.3888, lng: -3.7444 },
		barrios: [
			{
				neighborhood_id: '101',
				num_bar: '1',
				nom_bar: 'LOS CARMENES',
				centroid: { lat: 40.3988, lng: -3.7544 },
			},
			{
				neighborhood_id: '102',
				num_bar: '2',
				nom_bar: 'PUERTA DEL ANGEL',
				centroid: { lat: 40.3888, lng: -3.7444 },
			},
			{
				neighborhood_id: '103',
				num_bar: '3',
				nom_bar: 'LUCERO',
				centroid: { lat: 40.3788, lng: -3.7344 },
			},
			{
				neighborhood_id: '104',
				num_bar: '4',
				nom_bar: 'ALUCHE',
				centroid: { lat: 40.3688, lng: -3.7244 },
			},
			{
				neighborhood_id: '105',
				num_bar: '5',
				nom_bar: 'CAMPAMENTO',
				centroid: { lat: 40.3588, lng: -3.7144 },
			},
			{
				neighborhood_id: '106',
				num_bar: '6',
				nom_bar: 'CUATRO VIENTOS',
				centroid: { lat: 40.3488, lng: -3.7044 },
			},
			{
				neighborhood_id: '107',
				num_bar: '7',
				nom_bar: 'AGUILAS',
				centroid: { lat: 40.3388, lng: -3.6944 },
			},
		],
	},
	{
		district_id: '11',
		nom_dis: 'CARABANCHEL',
		centroid: { lat: 40.3859, lng: -3.7234 },
		barrios: [
			{
				neighborhood_id: '111',
				num_bar: '1',
				nom_bar: 'COMILLAS',
				centroid: { lat: 40.3959, lng: -3.7334 },
			},
			{
				neighborhood_id: '112',
				num_bar: '2',
				nom_bar: 'OPANEL',
				centroid: { lat: 40.3859, lng: -3.7234 },
			},
			{
				neighborhood_id: '113',
				num_bar: '3',
				nom_bar: 'SAN ISIDRO',
				centroid: { lat: 40.3759, lng: -3.7134 },
			},
			{
				neighborhood_id: '114',
				num_bar: '4',
				nom_bar: 'VISTA ALEGRE',
				centroid: { lat: 40.3659, lng: -3.7034 },
			},
			{
				neighborhood_id: '115',
				num_bar: '5',
				nom_bar: 'PUERTA BONITA',
				centroid: { lat: 40.3559, lng: -3.6934 },
			},
			{
				neighborhood_id: '116',
				num_bar: '6',
				nom_bar: 'BUENAVISTA',
				centroid: { lat: 40.3459, lng: -3.6834 },
			},
			{
				neighborhood_id: '117',
				num_bar: '7',
				nom_bar: 'ABRANTES',
				centroid: { lat: 40.3359, lng: -3.6734 },
			},
		],
	},
	{
		district_id: '12',
		nom_dis: 'USERA',
		centroid: { lat: 40.3855, lng: -3.7056 },
		barrios: [
			{
				neighborhood_id: '121',
				num_bar: '1',
				nom_bar: 'ORCASITAS',
				centroid: { lat: 40.3955, lng: -3.7156 },
			},
			{
				neighborhood_id: '122',
				num_bar: '2',
				nom_bar: 'ORCASUR',
				centroid: { lat: 40.3855, lng: -3.7056 },
			},
			{
				neighborhood_id: '123',
				num_bar: '3',
				nom_bar: 'SAN FERMIN',
				centroid: { lat: 40.3755, lng: -3.6956 },
			},
			{
				neighborhood_id: '124',
				num_bar: '4',
				nom_bar: 'ALMENDRALES',
				centroid: { lat: 40.3655, lng: -3.6856 },
			},
			{
				neighborhood_id: '125',
				num_bar: '5',
				nom_bar: 'MOSCARDO',
				centroid: { lat: 40.3555, lng: -3.6756 },
			},
			{
				neighborhood_id: '126',
				num_bar: '6',
				nom_bar: 'ZOFIO',
				centroid: { lat: 40.3455, lng: -3.6656 },
			},
			{
				neighborhood_id: '127',
				num_bar: '7',
				nom_bar: 'PRADOLONGO',
				centroid: { lat: 40.3355, lng: -3.6556 },
			},
		],
	},
	{
		district_id: '13',
		nom_dis: 'PUENTE DE VALLECAS',
		centroid: { lat: 40.3914, lng: -3.6642 },
		barrios: [
			{
				neighborhood_id: '131',
				num_bar: '1',
				nom_bar: 'ENTREVIAS',
				centroid: { lat: 40.4014, lng: -3.6742 },
			},
			{
				neighborhood_id: '132',
				num_bar: '2',
				nom_bar: 'SAN DIEGO',
				centroid: { lat: 40.3914, lng: -3.6642 },
			},
			{
				neighborhood_id: '133',
				num_bar: '3',
				nom_bar: 'PALOMERAS BAJAS',
				centroid: { lat: 40.3814, lng: -3.6542 },
			},
			{
				neighborhood_id: '134',
				num_bar: '4',
				nom_bar: 'PALOMERAS SURESTE',
				centroid: { lat: 40.3714, lng: -3.6442 },
			},
			{
				neighborhood_id: '135',
				num_bar: '5',
				nom_bar: 'PORTAZGO',
				centroid: { lat: 40.3614, lng: -3.6342 },
			},
			{
				neighborhood_id: '136',
				num_bar: '6',
				nom_bar: 'NUMANCIA',
				centroid: { lat: 40.3514, lng: -3.6242 },
			},
		],
	},
	{
		district_id: '14',
		nom_dis: 'MORATALAZ',
		centroid: { lat: 40.4089, lng: -3.6394 },
		barrios: [
			{
				neighborhood_id: '141',
				num_bar: '1',
				nom_bar: 'PAVONES',
				centroid: { lat: 40.4189, lng: -3.6494 },
			},
			{
				neighborhood_id: '142',
				num_bar: '2',
				nom_bar: 'HORCAJO',
				centroid: { lat: 40.4089, lng: -3.6394 },
			},
			{
				neighborhood_id: '143',
				num_bar: '3',
				nom_bar: 'MARROQUINA',
				centroid: { lat: 40.3989, lng: -3.6294 },
			},
			{
				neighborhood_id: '144',
				num_bar: '4',
				nom_bar: 'MEDIA LEGUA',
				centroid: { lat: 40.3889, lng: -3.6194 },
			},
			{
				neighborhood_id: '145',
				num_bar: '5',
				nom_bar: 'FONTARRON',
				centroid: { lat: 40.3789, lng: -3.6094 },
			},
			{
				neighborhood_id: '146',
				num_bar: '6',
				nom_bar: 'VINATEROS',
				centroid: { lat: 40.3689, lng: -3.5994 },
			},
		],
	},
	{
		district_id: '15',
		nom_dis: 'CIUDAD LINEAL',
		centroid: { lat: 40.4389, lng: -3.6458 },
		barrios: [
			{
				neighborhood_id: '151',
				num_bar: '1',
				nom_bar: 'VENTAS',
				centroid: { lat: 40.4489, lng: -3.6558 },
			},
			{
				neighborhood_id: '152',
				num_bar: '2',
				nom_bar: 'PUEBLO NUEVO',
				centroid: { lat: 40.4389, lng: -3.6458 },
			},
			{
				neighborhood_id: '153',
				num_bar: '3',
				nom_bar: 'QUINTANA',
				centroid: { lat: 40.4289, lng: -3.6358 },
			},
			{
				neighborhood_id: '154',
				num_bar: '4',
				nom_bar: 'LA CONCEPCION',
				centroid: { lat: 40.4189, lng: -3.6258 },
			},
			{
				neighborhood_id: '155',
				num_bar: '5',
				nom_bar: 'SAN PASCUAL',
				centroid: { lat: 40.4089, lng: -3.6158 },
			},
			{
				neighborhood_id: '156',
				num_bar: '6',
				nom_bar: 'SAN JUAN BAUTISTA',
				centroid: { lat: 40.3989, lng: -3.6058 },
			},
			{
				neighborhood_id: '157',
				num_bar: '7',
				nom_bar: 'COLINA',
				centroid: { lat: 40.3889, lng: -3.5958 },
			},
			{
				neighborhood_id: '158',
				num_bar: '8',
				nom_bar: 'ATALAYA',
				centroid: { lat: 40.3789, lng: -3.5858 },
			},
			{
				neighborhood_id: '159',
				num_bar: '9',
				nom_bar: 'COSTILLARES',
				centroid: { lat: 40.3689, lng: -3.5758 },
			},
		],
	},
	{
		district_id: '16',
		nom_dis: 'HORTALEZA',
		centroid: { lat: 40.4696, lng: -3.6394 },
		barrios: [
			{
				neighborhood_id: '161',
				num_bar: '1',
				nom_bar: 'PALOMAS',
				centroid: { lat: 40.4796, lng: -3.6494 },
			},
			{
				neighborhood_id: '162',
				num_bar: '2',
				nom_bar: 'PIOVERA',
				centroid: { lat: 40.4696, lng: -3.6394 },
			},
			{
				neighborhood_id: '163',
				num_bar: '3',
				nom_bar: 'CANILLAS',
				centroid: { lat: 40.4596, lng: -3.6294 },
			},
			{
				neighborhood_id: '164',
				num_bar: '4',
				nom_bar: 'PINAR DEL REY',
				centroid: { lat: 40.4496, lng: -3.6194 },
			},
			{
				neighborhood_id: '165',
				num_bar: '5',
				nom_bar: 'APOSTOL SANTIAGO',
				centroid: { lat: 40.4396, lng: -3.6094 },
			},
			{
				neighborhood_id: '166',
				num_bar: '6',
				nom_bar: 'VALDEFUENTES',
				centroid: { lat: 40.4296, lng: -3.5994 },
			},
		],
	},
	{
		district_id: '17',
		nom_dis: 'VILLAVERDE',
		centroid: { lat: 40.3519, lng: -3.7056 },
		barrios: [
			{
				neighborhood_id: '171',
				num_bar: '1',
				nom_bar: 'VILLAVERDE ALTO - CASCO HISTORICO DE VILLAVERDE',
				centroid: { lat: 40.3619, lng: -3.7156 },
			},
			{
				neighborhood_id: '172',
				num_bar: '2',
				nom_bar: 'SAN CRISTOBAL',
				centroid: { lat: 40.3519, lng: -3.7056 },
			},
			{
				neighborhood_id: '173',
				num_bar: '3',
				nom_bar: 'BUTARQUE',
				centroid: { lat: 40.3419, lng: -3.6956 },
			},
			{
				neighborhood_id: '174',
				num_bar: '4',
				nom_bar: 'LOS ROSALES',
				centroid: { lat: 40.3319, lng: -3.6856 },
			},
			{
				neighborhood_id: '175',
				num_bar: '5',
				nom_bar: 'ANGELES',
				centroid: { lat: 40.3219, lng: -3.6756 },
			},
		],
	},
	{
		district_id: '18',
		nom_dis: 'VILLA DE VALLECAS',
		centroid: { lat: 40.3519, lng: -3.6231 },
		barrios: [
			{
				neighborhood_id: '181',
				num_bar: '1',
				nom_bar: 'CASCO HISTORICO DE VALLECAS',
				centroid: { lat: 40.3619, lng: -3.6331 },
			},
			{
				neighborhood_id: '182',
				num_bar: '2',
				nom_bar: 'SANTA EUGENIA',
				centroid: { lat: 40.3519, lng: -3.6231 },
			},
			{
				neighborhood_id: '183',
				num_bar: '3',
				nom_bar: 'ENSANCHE DE VALLECAS',
				centroid: { lat: 40.3419, lng: -3.6131 },
			},
		],
	},
	{
		district_id: '19',
		nom_dis: 'VICALVARO',
		centroid: { lat: 40.4089, lng: -3.595 },
		barrios: [
			{
				neighborhood_id: '191',
				num_bar: '1',
				nom_bar: 'CASCO HISTORICO DE VICALVARO',
				centroid: { lat: 40.4189, lng: -3.605 },
			},
			{
				neighborhood_id: '192',
				num_bar: '2',
				nom_bar: 'VALDEBERNARDO',
				centroid: { lat: 40.4089, lng: -3.595 },
			},
			{
				neighborhood_id: '193',
				num_bar: '3',
				nom_bar: 'VALDERRIVAS',
				centroid: { lat: 40.3989, lng: -3.585 },
			},
			{
				neighborhood_id: '194',
				num_bar: '4',
				nom_bar: 'EL CANAVERAL',
				centroid: { lat: 40.3889, lng: -3.575 },
			},
		],
	},
	{
		district_id: '20',
		nom_dis: 'SAN BLAS-CANILLEJAS',
		centroid: { lat: 40.4696, lng: -3.595 },
		barrios: [
			{
				neighborhood_id: '201',
				num_bar: '1',
				nom_bar: 'SIMANCAS',
				centroid: { lat: 40.4796, lng: -3.605 },
			},
			{
				neighborhood_id: '202',
				num_bar: '2',
				nom_bar: 'HELLIN',
				centroid: { lat: 40.4696, lng: -3.595 },
			},
			{
				neighborhood_id: '203',
				num_bar: '3',
				nom_bar: 'AMPOSTA',
				centroid: { lat: 40.4596, lng: -3.585 },
			},
			{
				neighborhood_id: '204',
				num_bar: '4',
				nom_bar: 'ARCOS',
				centroid: { lat: 40.4496, lng: -3.575 },
			},
			{
				neighborhood_id: '205',
				num_bar: '5',
				nom_bar: 'ROSAS',
				centroid: { lat: 40.4396, lng: -3.565 },
			},
			{
				neighborhood_id: '206',
				num_bar: '6',
				nom_bar: 'REJAS',
				centroid: { lat: 40.4296, lng: -3.555 },
			},
			{
				neighborhood_id: '207',
				num_bar: '7',
				nom_bar: 'CANILLEJAS',
				centroid: { lat: 40.4196, lng: -3.545 },
			},
			{
				neighborhood_id: '208',
				num_bar: '8',
				nom_bar: 'EL SALVADOR',
				centroid: { lat: 40.4096, lng: -3.535 },
			},
		],
	},
	{
		district_id: '21',
		nom_dis: 'BARAJAS',
		centroid: { lat: 40.4696, lng: -3.575 },
		barrios: [
			{
				neighborhood_id: '211',
				num_bar: '1',
				nom_bar: 'ALAMEDA DE OSUNA',
				centroid: { lat: 40.4796, lng: -3.585 },
			},
			{
				neighborhood_id: '212',
				num_bar: '2',
				nom_bar: 'AEROPUERTO',
				centroid: { lat: 40.4696, lng: -3.575 },
			},
			{
				neighborhood_id: '213',
				num_bar: '3',
				nom_bar: 'CASCO HISTORICO DE BARAJAS',
				centroid: { lat: 40.4596, lng: -3.565 },
			},
			{
				neighborhood_id: '214',
				num_bar: '4',
				nom_bar: 'TIMON',
				centroid: { lat: 40.4496, lng: -3.555 },
			},
			{
				neighborhood_id: '215',
				num_bar: '5',
				nom_bar: 'CORRALEJOS',
				centroid: { lat: 40.4396, lng: -3.545 },
			},
		],
	},
]
