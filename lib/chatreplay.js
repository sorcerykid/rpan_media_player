function ChatReplay( video_player, base_elem_id, o_show_title_id, o_subreddit_id )
{
	let base_elem = document.getElementById( base_elem_id );
	let o_show_title_elem = document.getElementById( o_show_title_id );
	let o_subreddit_elem = document.getElementById( o_subreddit_id );
	
	let output = '';
	let report = null;
	let last_idx = 0;
	let last_elapsed  = null;
	let timer = null;
	let msg_templates = {
		reader: '<dt id="message_%s"><img src="avatars/snoo%d.png" align="left" width="42" height="42"><b><big><a href="http://www.reddit.com/u/%s" target="_blank">%s</a></big></b> &nbsp;<small><font color="gray">%s days ago</font></small></dt><dd>%s</dd>\n',
		poster: '<dt id="message_%s"><img src="avatars/snoo%d.png" align="left" width="42" height="42"><b><big><a href="http://www.reddit.com/u/%s" target="_blank">%s</a></big></b> &nbsp;<strong>BROADCASTER</strong> &nbsp;<small><font color="gray">%s days ago</font></small></dt><dd>%s</dd>\n'
	};
	
	let getUniqueIdx = function ( author, start, range )
	{
		let a = 0;
		let b = 0;

		for( i = 0; i < author.length; i++ ) {
			a = ( a + author.charCodeAt( i ) ) % 255;
			b = ( a + b ) % 255;
		}

		return ( b * 256 + a ) % range + start;
	}
	
	let fromMarkdown = function ( md )
	{
		md = md.replace( /\* (.+?)\n+/g, '<li>$1</li>' );
		md = md.replace( /\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>' );
		md = md.replace( /\*\*(.+?)\*\*/g, '<b>$1</b>' );
		md = md.replace( /\*(.+?)\*/g, '<i>$1</i>' );
		md = md.replace( /\n+/g, '<br>' );
		return md;
	}
	
	let postMessageAfter = function ( v )
	{
		let template = v.author == report.post_author ?
			msg_templates.poster : msg_templates.reader;
		
		output += sprintf( template, v.leaf_id,
			getUniqueIdx( v.author, 1, 48 ), v.author, v.author,
			Math.floor( ( systime( ) - v.created ) / 86400 ),
			fromMarkdown( v.message ) );
		base_elem.innerHTML = '<dl>' + output + '</dl>';
		
		let last_elem = document.getElementById( 'message_' + v.leaf_id );
		last_elem.scrollIntoView( );  // auto-scroll to bottom of panel
	}
	
	let findNextMessage = function ( next_elapsed, callback )
	{
		let v = report.chat_list[ last_idx ];
		while( last_idx < report.chat_list.length ) {
			let v = report.chat_list[ last_idx ];
			if( v.created - report.post_created > next_elapsed ) {
				break;  // no new messages, so wait till next cycle
			}
			if( callback != undefined ) callback( v );
			last_idx++;
		}
	}
	
	this.load = function ( filespec )
	{
		let stream = new ActiveXObject( 'ADODB.Stream' );
		stream.CharSet = 'UTF-8';  // properly handle UTF-8 encoding
		stream.Open( );
		stream.LoadFromFile( filespec );
		report = JSON.parse( stream.ReadText( ) );
		stream.Close( );
		
		base_elem.innerHTML = '';
		o_show_title_elem.innerHTML = report.post_title;
		o_subreddit_elem.innerHTML = 'Submitted to r/' + report.subreddit;		
	}
	
	this.play = function ( )
	{
		timer = setInterval( function ( ) {
			let next_elapsed = video_player.getCurrentTime( );
			
			findNextMessage( next_elapsed, postMessageAfter );
			last_elapsed = next_elapsed;
		}, 1000 );
	}
	
	this.seek = function ( )
	{
		let next_elapsed = video_player.getCurrentTime( );
		
		if( next_elapsed - last_elapsed > 0 && next_elapsed - last_elapsed < 60 * 5 ) {
			findNextMessage( next_elapsed, postMessageAfter );
		}
		else if( next_elapsed - last_elapsed == 0 ) {
			return;  // we're at the same place, don't do anything
		}
		else {
			output = '';
			last_idx = 0;
			base_elem.innerHTML = '';  // todo: handle reverse comments
			findNextMessage( next_elapsed );
		}
		
		last_elapsed = next_elapsed;
	}
	
	this.stop = function ( )
	{
		clearInterval( timer );
	}

	video_player.onPlay = this.play;
	video_player.onStop = this.stop;
	video_player.onSeek = this.seek;
	
	return this;
}
