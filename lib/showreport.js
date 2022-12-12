function ShowReport( chat_replay, base_elem_id )
{
	let base_elem = document.getElementById( base_elem_id );

	chat_replay.onLoad = function ( report )
	{
		let users = { };
		
		for( let i = 0; i < report.chat_list.length; i++ ) {
			let v = report.chat_list[ i ];
			if( users[ v.author ] == undefined ) {
				users[ v.author ] = { chat_count: 0, gold_count: 0 };
			}
			if( v.is_gold ) {
				users[ v.author ].gold_count += 1;
			}
			else {
				users[ v.author ].chat_count += 1;
			}
		}

		let output = '<table width="100%" cellpadding="0" cellspacing="5">\n' +
			'<tr><th colspan="2">Broadcast Details</th></tr>\n' +
			sprintf( '<tr><td width="25%"><b>Subreddit:</b></td><td width="75%"><a href="https://www.reddit.com/r/%s">%s</a></td></tr>\n',
				report.subreddit, report.subreddit ) +
			sprintf( '<tr><td><b>Post Title:</b></td><td>%s</td></tr>\n',
				report.post_title ) +
			sprintf( '<tr><td><b>Post Author:</b></td><td><a href="https://www.reddit.com/u/%s">%s</a></td></tr>\n',
				report.post_author, report.post_author ) +
			sprintf( '<tr><td><b>Post Date:</b></td><td>%s</td></tr>\n',
				strftime( '%Y-%m-%d %H:%M:%S', report.post_created, 0 ) ) +
			sprintf( '<tr><td><b>Post Score:</b></td><td>%d points</td></tr>\n',
				report.post_score ) +
			sprintf( '<tr><td><b>Stream URL:</b></td><td><a href="https://www.reddit.com/rpan/r/%s/%s">https://www.reddit.com/rpan/r/%s/%s</a></td></tr>\n',
				report.subreddit, report.stream_id, report.subreddit, report.stream_id ) +
			'</table>\n' +
			'<table width="100%" cellpadding="0" cellspacing="5">\n' +
			'<tr><th colspan="3">Member Activity</th></tr>\n';
			
		for( let k in users ) {
			let v = users[ k ];
			output += sprintf( '<tr><td width="40%"><a href="https://www.reddit.com/u/%s">%s</a></td><td width="30%">%d Messages</td><td width="30%">%d Awards</td></tr>\n',
				k, k, v.chat_count, v.gold_count );
		}
		
		output += '</table>\n' +
			'<table width="100%" cellpadding="0" cellspacing="5">\n' +
			'<tr><th colspan="2">Award History</th></tr>\n';

		for( let i = 0; i < report.gold_list.length; i++ ) {
			let v = report.gold_list[ i ];
			output += sprintf( '<tr><td width="40%"><a href="https://www.reddit.com/u/%s">%s</a></td><td width="60%">Gave <b>%s</b></td></tr>\n',
				v.sender, v.sender, v.award );
		}

		output += '</table>\n';

		base_elem.innerHTML = output;
	}
	
	chat_replay.onUnload = function ( )
	{
		base_elem.innerHTML = '';
	}
}
