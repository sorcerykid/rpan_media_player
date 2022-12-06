window._C = null;

function is_match( text, regex )
{
	window._C = text.match( regex );
	return window._C != null;
}

function strftime( tmpl, timestamp, timezone )
{
	let regex = /%([admbyYzZHMS])/g;
	let date = new Date( ( timestamp + 3600 * timezone ) * 1000 );
	let utc_format = date.toUTCString( );  // Tue, 12 May 2020 23:50:21 GMT
	let iso_format = date.toISOString( );  // 2020-05-12T23:50:21.817Z
	
	return tmpl.replace( regex, function ( exp, type )
	{
		if( exp == '%%' )
			return '%';
			
		switch( type ) {
			case 'a':
				return utc_format.substr( 0, 3 );
			case 'd':
				return iso_format.substr( 8, 2 );
			case 'm':
				return iso_format.substr( 5, 2 );
			case 'b':
				return utc_format.substr( 8, 3 );
			case 'y':
				return iso_format.substr( 2, 2 );
			case 'Y':
				return iso_format.substr( 0, 4 );
			case 'H':
				return iso_format.substr( 11, 2 );
			case 'M':
				return iso_format.substr( 14, 2 );
			case 'S':
				return iso_format.substr( 17, 2 );
		}		
	} )
}

function systime( )
{
	return Math.floor( Date.now( ) / 1000 );
}	

function sprintf( tmpl )
{
	let regex = /%([-0])?([0-9]+)?(\.[0-9]+)?([sdf%])/g;
	let args = arguments;
	let idx = 1;
	
	return tmpl.replace( regex, function ( exp, p0, p1, p2, p3 )
	{
		if( exp == '%%' )
			return '%';
		else if( idx >= args.length )
			return 'undefined';

		let type = p3;
		let prec = p2 != undefined ? parseInt( p2.substr( 1 ) ) : 6;
		let size = p1 != undefined ? parseInt( p1 ) : 0;
		let fill = p0 == '0' && type != 's' ? '0' : ' ';
		let is_sign = type != 's' && args[ idx ] < 0;
		let is_left = p0 == '-';
		
		let str;
		switch( type ) {
			case 's':
				str = args[ idx ];
				break;
			case 'd':
				str = parseFloat( args[ idx ] ).toFixed( 0 );
				break;
			case 'f':
				str = parseFloat( args[ idx ] ).toFixed( prec );
				break;
		}
		while( str.length < size ) {
			str = is_left ? str + ' ' : fill + str;
			if( fill == '0' && !is_left && is_sign )
				str = '-0' + str.substr( 2 );  // fun corner case!
		}

		idx++;

		return str;
	} );
}