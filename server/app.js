const express = require('express');
var formidable = require('formidable');
var sizeOf = require('image-size');
var mysql = require('mysql');
var ejs  = require('ejs');
const fs = require('fs');
var url = require('url');
var http = require('http');
var cookieSession = require('cookie-session');
var cors = require('cors')

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'robert',
  password : 'password',
  database : 'gifsaw_users'
});
connection.connect();

var connectionP = mysql.createConnection({
  host     : 'localhost',
  user     : 'robert',
  password : 'password',
  database : 'gifsaw_puzzles'
});
connectionP.connect();

var adjectives=  ['ace', 'all', 'alt', 'anal', 'ant', 'apt', 'arch', 'backed', 'baked', 'bare', 'bats', 'beige', 'bent', 'bit', 'blah', 'blame', 'blocked', 'blond', 'blonde', 'blown', 'bluff', 'blunt', 'bold', 'both', 'bought', 'bound', 'brave', 'brief', 'broke', 'bugs', 'built', 'burned', 'burst', 'bust', 'bye', 'calm', 'chance', 'charged', 'cheap', 'checked', 'chic', 'chill', 'choice', 'clean', 'cool', 'crack', 'crisp', 'crossed', 'crude', 'cur', 'cute', 'damn', 'dash', 'deaf', 'deal', 'dense', 'dim', 'done', 'dried', 'drunk', 'dryer', 'due', 'dull', 'earned', 'edge', 'eight', 'eighth', 'elect', 'else', 'eyed', 'fake', 'far', 'farm', 'fat', 'feat', 'fell', 'felt', 'few', 'firm', 'fit', 'flip', 'flush', 'fold', 'fond', 'fool', 'forced', 'foul', 'found', 'fresh', 'fun', 'gauge', 'gone', 'grab', 'grave', 'grown', 'guns', 'harsh', 'held', 'here', 'het', 'hex', 'hit', 'hooked', 'huge', 'hurt', 'inter', 'jade', 'kept', 'kind', 'lame', 'lean', 'left', 'less', 'like', 'linked', 'lit', 'lived', 'log', 'lone', 'loud', 'mad', 'made', 'mailed', 'marked', 'mat', 'meet', 'mere', 'metal', 'mild', 'mob', 'mod', 'much', 'mum', 'must', 'near', 'neat', 'next', 'ninth', 'nude', 'nuts', 'once', 'over', 'own', 'paid', 'pale', 'passed', 'picked', 'plump', 'plus', 'plush', 'print', 'prompt', 'prone', 'proud', 'punk', 'pushed', 'quit', 'raised', 'rare', 'refer', 'rent', 'rid', 'ripe', 'roast', 'rush', 'sad', 'said', 'same', 'sap', 'score', 'scrap', 'sec', 'seen', 'self', 'sent', 'shaped', 'shed', 'sheer', 'shut', 'shy', 'sixth', 'size', 'sized', 'ski', 'skilled', 'slate', 'slight', 'smoked', 'sold', 'sole', 'some', 'sore', 'sought', 'spare', 'spec', 'spent', 'sport', 'steep', 'stiff', 'stopped', 'store', 'straw', 'stretch', 'strict', 'stuck', 'stuffed', 'such', 'super', 'sure', 'switch', 'tai', 'tan', 'taught', 'teen', 'tenth', 'then', 'thick', 'thin', 'through', 'thrown', 'thru', 'tied', 'tight', 'tired', 'toe', 'told', 'tops', 'torn', 'touched', 'tough', 'tried', 'trim', 'twin', 'twp', 'used', 'vast', 'void', 'waste', 'wed', 'wee', 'well', 'wide', 'wired', 'won', 'worked', 'worn', 'worse', 'worst', 'wound', 'wrapped', 'about', 'abroad', 'absorbed', 'abused', 'across', 'acting', 'added', 'adult', 'advised', 'afraid', 'after', 'aged', 'aging', 'ago', 'agreed', 'ahead', 'air', 'airborne', 'alert', 'alien', 'alike', 'alive', 'alleged', 'allowed', 'alone', 'alright', 'altered', 'amazed', 'amber', 'ample', 'announced', 'anti', 'antique', 'apart', 'applied', 'arranged', 'asking', 'asleep', 'asphalt', 'assumed', 'assured', 'attached', 'attack', 'avid', 'awake', 'aware', 'away', 'awesome', 'awful', 'backward', 'balanced', 'banner', 'baptist', 'bar', 'basic', 'beaded', 'beaten', 'beating', 'beetle', 'behind', 'bigger', 'biggest', 'billion', 'bizarre', 'bomb', 'boring', 'breaking', 'breeding', 'brilliant', 'broadband', 'broadcast', 'brunette', 'brutal', 'buried', 'busty', 'caller', 'cancelled', 'careful', 'caring', 'catching', 'centered', 'certain', 'changing', 'charming', 'chartered', 'chill', 'chin', 'chronic', 'chubby', 'citrus', 'closer', 'closest', 'cloudy', 'coastal', 'coated', 'collect', 'combined', 'coming', 'compact', 'complete', 'composed', 'concerned', 'concise', 'confined', 'confirmed', 'confused', 'conscious', 'consumed', 'contained', 'controlled', 'convinced', 'cooking', 'copied', 'cordless', 'correct', 'corrupt', 'costly', 'counter', 'countless', 'crimson', 'crowded', 'crucial', 'cruel', 'crying', 'custom', 'dam', 'damaged', 'dancing', 'dated', 'daytime', 'deceased', 'decent', 'declared', 'defined', 'depressed', 'described', 'desert', 'designed', 'desired', 'detached', 'detailed', 'diet', 'dirty', 'disclosed', 'discreet', 'discrete', 'displayed', 'dissolved', 'distinct', 'disturbed', 'diverse', 'downstream', 'dozen', 'driven', 'dropping', 'dryer', 'dying', 'eaten', 'eating', 'eighteen', 'elder', 'elect', 'elite', 'endless', 'endorsed', 'enhanced', 'enlarged', 'enough', 'enrolled', 'entire', 'equipped', 'ethnic', 'exact', 'exempt', 'expert', 'expired', 'exposed', 'failing', 'faithful', 'famous', 'farming', 'fatal', 'fatigue', 'featured', 'feeling', 'fewer', 'fifteen', 'fifty', 'finest', 'finished', 'finite', 'fitted', 'fitting', 'floppy', 'flowing', 'focused', 'former', 'frequent', 'freshman', 'frontier', 'frozen', 'funded', 'funky', 'fuzzy', 'gamer', 'gifted', 'giving', 'glossy', 'gorgeous', 'grateful', 'gratis', 'grave', 'gravel', 'guiding', 'guilty', 'handed', 'handled', 'handmade', 'handsome', 'handy', 'hardback', 'hardwood', 'harmful', 'hated', 'haunted', 'headed', 'healing', 'healthy', 'heated', 'heating', 'helpful', 'herbal', 'here', 'hidden', 'highest', 'hollow', 'homeless', 'honest', 'horny', 'hottest', 'hourly', 'hungry', 'hydro', 'ignored', 'immune', 'implied', 'imposed', 'improved', 'increased', 'indoor', 'inform', 'informed', 'injured', 'insane', 'inspired', 'insured', 'intact', 'intense', 'intent', 'intern', 'involved', 'japan', 'jet', 'juicy', 'killing', 'kindly', 'kinky', 'knowing', 'lacking', 'laden', 'landed', 'larger', 'largest', 'lasting', 'later', 'latest', 'latter', 'learned', 'leisure', 'licensed', 'lifelong', 'lightweight', 'likely', 'lively', 'loaded', 'longer', 'looking', 'losing', 'lovely', 'loyal', 'lying', 'lyric', 'mainstream', 'maintained', 'male', 'man', 'many', 'married', 'massive', 'mature', 'meaning', 'measured', 'mere', 'midi', 'mighty', 'million', 'minded', 'mini', 'minute', 'mis', 'model', 'modest', 'mono', 'monthly', 'moody', 'mounted', 'mutant', 'naming', 'nasty', 'naughty', 'neighbor', 'nested', 'neural', 'newborn', 'nightly', 'noisy', 'noted', 'noticed', 'novel', 'novice', 'nudist', 'oblique', 'obscure', 'observed', 'offshore', 'often', 'okay', 'older', 'oldest', 'only', 'outdoor', 'outlined', 'over', 'packaged', 'padded', 'pagan', 'painful', 'pan', 'par', 'pass', 'patent', 'patient', 'peaceful', 'pedal', 'pendant', 'pending', 'perceived', 'percent', 'petite', 'pewter', 'piano', 'picked', 'piercing', 'plastics', 'plated', 'pointing', 'polished', 'poorly', 'powered', 'precise', 'pregnant', 'premier', 'premiere', 'prepared', 'preschool', 'prescribed', 'present', 'preserved', 'pressing', 'pretend', 'pretty', 'printed', 'probing', 'produced', 'profound', 'pronounced', 'proposed', 'prostate', 'proven', 'proxy', 'pseudo', 'puffy', 'pushing', 'pussy', 'quiet', 'racing', 'racist', 'raising', 'randy', 'ranking', 'rebel', 'record', 'refer', 'refined', 'released', 'removed', 'renowned', 'rental', 'required', 'resolved', 'restored', 'retail', 'retained', 'retired', 'revealed', 'rigid', 'rival', 'robust', 'rounded', 'routine', 'rugged', 'ruling', 'said', 'sandy', 'saving', 'savvy', 'scary', 'scientific', 'seamless', 'searching', 'second', 'secure', 'seeing', 'seeking', 'seismic', 'select', 'semi', 'serviced', 'severe', 'sexy', 'shallow', 'shaping', 'shining', 'shiny', 'shortcut', 'singing', 'sister', 'sixteen', 'sixty', 'skinny', 'smiling', 'smoking', 'solvent', 'sometime', 'sorry', 'spacious', 'spanking', 'spatial', 'spicy', 'spiral', 'spoken', 'squirting', 'starring', 'stated', 'statewide', 'stellar', 'stolen', 'stopping', 'store', 'streaming', 'structured', 'studied', 'stunning', 'stupid', 'stylish', 'subtle', 'suited', 'sunrise', 'sunset', 'super', 'superb', 'supposed', 'surplus', 'surprised', 'suspect', 'taboo', 'tailored', 'taken', 'taking', 'talking', 'tarot', 'tasty', 'teenage', 'telling', 'tender', 'textbook', 'textile', 'thinking', 'thirteen', 'timely', 'tiny', 'titled', 'tony', 'topless', 'torrent', 'touching', 'touring', 'tourist', 'toward', 'toxic', 'transient', 'traveled', 'tribal', 'twenty', 'unchanged', 'unclear', 'uncut', 'unfair', 'unique', 'unlike', 'unsigned', 'unsure', 'unused', 'upgrade', 'upset', 'upstream', 'upward', 'urgent', 'useful', 'useless', 'valid', 'varied', 'vibrant', 'viral', 'vivid', 'vivo', 'walnut', 'wanting', 'warming', 'warning', 'wasted', 'wearing', 'weekly', 'weighted', 'welcome', 'western', 'wholesale', 'wicked', 'wider', 'widespread', 'willing', 'wiring', 'withdrawn', 'wizard', 'worldwide', 'worried', 'worthy', 'wounded', 'woven', 'written', 'yearly', 'younger', 'zoning'];
var nouns=  ['aches', 'aides', 'aids', 'aims', 'airs', 'ales', 'alfas', 'alias', 'alps', 'alts', 'amps', 'ands', 'ants', 'apes', 'arcs', 'ares', 'arks', 'arms', 'arts', 'asps', 'autos', 'ayes', 'bags', 'bails', 'baits', 'bakes', 'bangs', 'bans', 'bates', 'beads', 'belts', 'bends', 'bents', 'bets', 'bids', 'bikes', 'bins', 'bites', 'bits', 'blahs', 'blames', 'blends', 'blinks', 'blondes', 'blonds', 'blooms', 'blues', 'bluffs', 'boasts', 'boats', 'bobs', 'bolts', 'boobs', 'booms', 'boosts', 'boots', 'bores', 'bots', 'bounds', 'bouts', 'bowls', 'boys', 'bras', 'brass', 'braves', 'breasts', 'breaths', 'breeds', 'briefs', 'bros', 'bulbs', 'burns', 'bursts', 'buss', 'busts', 'buts', 'byes', 'bytes', 'caches', 'cairns', 'cakes', 'calms', 'calves', 'cames', 'caps', 'cards', 'carts', 'caves', 'cents', 'certs', 'cess', 'chairs', 'champs', 'charms', 'charts', 'chats', 'cheats', 'checks', 'cheeks', 'cheers', 'chefs', 'cheques', 'chess', 'chills', 'chimes', 'chis', 'choirs', 'chores', 'chunks', 'claims', 'clamps', 'clans', 'cleans', 'clerks', 'climbs', 'clips', 'clocks', 'clones', 'clothes', 'cloths', 'clowns', 'clues', 'coils', 'coins', 'comps', 'cones', 'cools', 'copes', 'cops', 'cords', 'coss', 'cotes', 'coupes', 'coves', 'crabs', 'cracks', 'cramps', 'craps', 'creeds', 'crests', 'crews', 'cribs', 'cries', 'crisps', 'crooks', 'cubes', 'cues', 'cuffs', 'cults', 'curbs', 'cures', 'curls', 'curs', 'curves', 'dads', 'damns', 'darts', 'dates', 'days', 'deals', 'deeds', 'dens', 'dents', 'desks', 'dials', 'dies', 'digs', 'disks', 'divs', 'docks', 'docs', 'domes', 'dongs', 'dooms', 'doors', 'dos', 'doss', 'doubts', 'doughs', 'drags', 'drains', 'draws', 'dreams', 'drills', 'drinks', 'drives', 'droughts', 'droves', 'drunks', 'dryers', 'dubs', 'ducks', 'dudes', 'dues', 'dumps', 'dunes', 'dyes', 'dykes', 'eats', 'edits', 'eggs', 'eighths', 'eights', 'elects', 'elks', 'elves', 'ess', 'eyes', 'facts', 'fades', 'fails', 'fakes', 'falls', 'fames', 'fares', 'farms', 'fates', 'fats', 'faults', 'feats', 'feeds', 'feels', 'fells', 'felts', 'fights', 'files', 'finds', 'firms', 'fists', 'fits', 'fives', 'flakes', 'flames', 'flaps', 'flares', 'flats', 'flaws', 'flicks', 'flips', 'floats', 'floss', 'flours', 'flows', 'flus', 'flutes', 'foams', 'foes', 'foils', 'folds', 'fonds', 'fonts', 'fools', 'forks', 'fouls', 'founds', 'francs', 'frauds', 'freaks', 'freights', 'fries', 'fris', 'funds', 'funs', 'fuss', 'gags', 'gains', 'gangs', 'gaps', 'geeks', 'gels', 'gems', 'gens', 'gents', 'ghosts', 'gifts', 'gigs', 'glands', 'gloss', 'glues', 'gnomes', 'gnus', 'golfs', 'goos', 'gores', 'gowns', 'grabs', 'grads', 'grapes', 'grasps', 'graves', 'griefs', 'grills', 'grimes', 'grips', 'grooves', 'growths', 'guards', 'guess', 'guns', 'gusts', 'guts', 'gyms', 'halves', 'hands', 'harms', 'hates', 'hats', 'haves', 'hawks', 'hearts', 'hecks', 'heels', 'heights', 'helps', 'hicks', 'hides', 'hikes', 'hills', 'hints', 'hires', 'hits', 'holes', 'hoops', 'hops', 'hordes', 'hounds', 'hows', 'hubs', 'hugs', 'humps', 'hums', 'hunks', 'hurts', 'hymns', 'hypes', 'ides', 'inks', 'intros', 'jacks', 'jades', 'jakes', 'james', 'jars', 'jaws', 'jeeps', 'joins', 'jokes', 'joss', 'jugs', 'jumps', 'junks', 'kas', 'khans', 'kills', 'kinds', 'kiss', 'knees', 'knits', 'knives', 'knobs', 'knows', 'kris', 'lacks', 'lads', 'lames', 'lass', 'leaks', 'leans', 'leaps', 'leas', 'leaves', 'lees', 'lefts', 'lengths', 'lens', 'less', 'lids', 'liens', 'lifts', 'likes', 'limbs', 'links', 'lives', 'loads', 'logs', 'lots', 'lucks', 'lungs', 'lures', 'lusts', 'macks', 'mains', 'malls', 'mars', 'marts', 'masks', 'mates', 'maths', 'mats', 'mayors', 'meats', 'meets', 'melts', 'meres', 'metals', 'miles', 'mils', 'mimes', 'minds', 'mists', 'mobs', 'modes', 'mods', 'molds', 'moms', 'months', 'moods', 'moves', 'mugs', 'mums', 'muss', 'musts', 'myths', 'names', 'nans', 'nats', 'nays', 'nears', 'necks', 'needs', 'nerves', 'nests', 'niches', 'nouns', 'nous', 'nows', 'nudes', 'nukes', 'oats', 'obs', 'odds', 'oos', 'ops', 'overs', 'owls', 'packs', 'pads', 'pains', 'paints', 'pales', 'pants', 'pars', 'pas', 'pass', 'pastes', 'paths', 'pauls', 'paws', 'pays', 'pears', 'peers', 'pees', 'perks', 'phones', 'picks', 'pics', 'pies', 'piles', 'pills', 'pings', 'plans', 'plaques', 'pleas', 'plots', 'plugs', 'plumps', 'plus', 'poets', 'polls', 'pos', 'poss', 'pours', 'prayers', 'preps', 'preys', 'priests', 'prints', 'probes', 'prods', 'prompts', 'props', 'pros', 'psalms', 'psts', 'pubs', 'pulps', 'punks', 'pups', 'pus', 'quads', 'quakes', 'queens', 'quests', 'queues', 'quilts', 'quotes', 'rags', 'raids', 'rails', 'ramps', 'rants', 'rapes', 'raps', 'raves', 'realms', 'recs', 'reels', 'reeves', 'refers', 'refs', 'rents', 'rests', 'ribs', 'rides', 'roasts', 'robes', 'rogues', 'roles', 'routes', 'rugs', 'ruins', 'rules', 'sacks', 'sails', 'sakes', 'saps', 'sass', 'scarfs', 'scars', 'scarves', 'scats', 'scenes', 'scents', 'schemes', 'scoops', 'scopes', 'scores', 'scraps', 'screams', 'scrolls', 'seals', 'seams', 'sears', 'seats', 'secs', 'seeks', 'selfs', 'sells', 'selves', 'sends', 'serves', 'shades', 'shakes', 'shames', 'sheds', 'sheers', 'shelves', 'shes', 'shifts', 'shines', 'shirts', 'shoots', 'shorts', 'shouts', 'shrimps', 'shrinks', 'shrubs', 'shuts', 'sighs', 'sights', 'sims', 'sings', 'sinks', 'sips', 'sites', 'sixths', 'skills', 'skirts', 'skis', 'slams', 'slates', 'sleeps', 'sleeves', 'slights', 'slips', 'slopes', 'sluts', 'smells', 'smiles', 'snacks', 'soles', 'sores', 'sorts', 'sos', 'spains', 'spams', 'spanks', 'spares', 'spears', 'specs', 'spells', 'sperms', 'spies', 'spines', 'spires', 'splits', 'spokes', 'spoons', 'sports', 'spots', 'sprays', 'sprints', 'spurs', 'squads', 'squids', 'squirts', 'stains', 'stairs', 'stakes', 'stalls', 'starts', 'stays', 'steals', 'steeps', 'stems', 'steps', 'stiffs', 'stocks', 'stops', 'stores', 'straits', 'straps', 'straws', 'streaks', 'stress', 'strikes', 'stripes', 'strokes', 'struts', 'stuffs', 'stunts', 'styles', 'sucks', 'suites', 'suits', 'sums', 'supers', 'sups', 'swaps', 'swears', 'sweats', 'sweeps', 'swings', 'syncs', 'tags', 'tails', 'tais', 'tales', 'tans', 'taps', 'tars', 'tasks', 'tastes', 'tears', 'techs', 'teens', 'tees', 'temps', 'tenths', 'terms', 'texts', 'thanks', 'thefts', 'themes', 'theres', 'thighs', 'things', 'thongs', 'thous', 'threads', 'threats', 'thrills', 'thrones', 'thrusts', 'thugs', 'thumbs', 'tiers', 'ties', 'tiffs', 'tights', 'tiles', 'tills', 'tips', 'tires', 'titans', 'toasts', 'toes', 'tolls', 'tombs', 'tomes', 'tongues', 'tonnes', 'tons', 'tools', 'toons', 'tops', 'tors', 'toss', 'totes', 'tots', 'toughs', 'tours', 'tracts', 'traits', 'traps', 'trays', 'treats', 'treks', 'trends', 'tribes', 'tricks', 'tries', 'trims', 'trips', 'trouts', 'trunks', 'truss', 'tubes', 'tubs', 'tufts', 'tunes', 'tweaks', 'twinks', 'twins', 'twists', 'tynes', 'typos', 'ufos', 'units', 'vacs', 'vales', 'valves', 'vaults', 'veins', 'vents', 'verbs', 'vests', 'vets', 'vibes', 'vines', 'vistas', 'voids', 'vols', 'volts', 'votes', 'vows', 'waists', 'waits', 'wales', 'wants', 'waps', 'wares', 'warts', 'wastes', 'ways', 'wears', 'weds', 'weeds', 'weeks', 'wees', 'weighs', 'wells', 'wheats', 'wheels', 'whens', 'wheres', 'whips', 'whores', 'whys', 'wides', 'widths', 'wills', 'wipes', 'wits', 'wives', 'woes', 'wolves', 'words', 'wounds', 'wows', 'wraps', 'wrists', 'wus', 'yachts', 'yarns', 'years', 'yeas', 'yeasts', 'yens', 'yes', 'yields', 'zips', 'zooms', 'zoos', 'abyss', 'accents', 'accords', 'aces', 'actress', 'addicts', 'address', 'admins', 'adults', 'adverts', 'aegis', 'affairs', 'affects', 'afters', 'aides', 'airbus', 'airlines', 'airplanes', 'airports', 'airs', 'airways', 'albums', 'alerts', 'aliases', 'aliens', 'allies', 'alloys', 'almonds', 'ambers', 'amends', 'amounts', 'amps', 'anas', 'angers', 'anglers', 'animes', 'annals', 'anthems', 'antiques', 'antis', 'anus', 'appeals', 'arcades', 'arches', 'archives', 'ares', 'armors', 'arrays', 'arrears', 'arrows', 'artists', 'artworks', 'asides', 'asphalts', 'assays', 'assets', 'assigns', 'assists', 'athletes', 'attacks', 'attempts', 'audits', 'authors', 'autos', 'avails', 'aves', 'aways', 'axes', 'backgrounds', 'backpacks', 'backyards', 'badgers', 'badges', 'bakers', 'ballets', 'bankers', 'banners', 'banquets', 'baptists', 'barkers', 'barons', 'barracks', 'bars', 'baseballs', 'basements', 'bases', 'basics', 'basins', 'basis', 'bathrooms', 'batons', 'beacons', 'beatings', 'bedrooms', 'beetles', 'behinds', 'beiges', 'beings', 'beliefs', 'bels', 'bidders', 'biddings', 'billiards', 'billings', 'billions', 'binders', 'bingos', 'biscuits', 'bitches', 'bites', 'bitters', 'blackjacks', 'blazers', 'blessings', 'blindness', 'blockers', 'blondes', 'blows', 'bluegrass', 'blueprints', 'bobcats', 'bombers', 'bombs', 'bookings', 'booklets', 'bookmarks', 'bookshops', 'boomers', 'bores', 'borings', 'boroughs', 'bothers', 'boulevards', 'bounces', 'boutiques', 'bowers', 'boyfriends', 'bracelets', 'braces', 'brass', 'breakers', 'breakfasts', 'breakthroughs', 'breathes', 'breedings', 'breezes', 'briefings', 'brigades', 'brightness', 'brilliants', 'broadcasts', 'broadways', 'brochures', 'brokers', 'broncos', 'browsers', 'browses', 'brunettes', 'budgets', 'builders', 'bullets', 'bureaus', 'burgers', 'burkes', 'burners', 'burrows', 'buttons', 'buyers', 'bylaws', 'cactus', 'caesars', 'callers', 'camels', 'campaigns', 'campers', 'campgrounds', 'cancels', 'candles', 'canoes', 'canons', 'canvas', 'canvass', 'capsules', 'captains', 'captions', 'captures', 'carats', 'carers', 'caress', 'carrots', 'carters', 'cartoons', 'casas', 'cashiers', 'cassettes', 'catchings', 'caucus', 'cautious', 'caves', 'ceases', 'ceilings', 'celebs', 'cellars', 'cements', 'census', 'chalets', 'chances', 'changers', 'chaos', 'chapters', 'chargers', 'chassis', 'checkers', 'chemists', 'childhoods', 'chilis', 'chills', 'chins', 'choices', 'choses', 'cigars', 'circles', 'cites', 'citrus', 'civics', 'claimants', 'classics', 'classmates', 'classrooms', 'clauses', 'cleaners', 'cleanings', 'clients', 'climates', 'clinics', 'clippers', 'clippings', 'closers', 'closures', 'clothes', 'clothings', 'clutters', 'coaches', 'coasters', 'coatings', 'cocos', 'cohorts', 'colleagues', 'collects', 'colons', 'colors', 'cols', 'combos', 'comes', 'comets', 'comings', 'comments', 'compacts', 'compares', 'complaints', 'compress', 'computes', 'comrades', 'concepts', 'concerns', 'condoms', 'conducts', 'conflicts', 'consents', 'constraints', 'constructs', 'contests', 'contexts', 'contrasts', 'converts', 'cookers', 'coolers', 'coopers', 'copes', 'cops', 'cores', 'cosmos', 'cougars', 'counsels', 'counters', 'countess', 'couples', 'couplings', 'coupons', 'courses', 'courtyards', 'cousins', 'covers', 'cowboys', 'coyotes', 'crackers', 'cranes', 'crickets', 'crisis', 'critics', 'critiques', 'critters', 'crosses', 'crossroads', 'crosswords', 'cruisers', 'cubes', 'cuisines', 'cures', 'curses', 'cursors', 'curtains', 'cushions', 'customs', 'cuties', 'cutters', 'cyclists', 'daemons', 'dams', 'dancers', 'dances', 'darkness', 'dashboards', 'daughters', 'deadlines', 'dealers', 'dealings', 'debates', 'debits', 'debris', 'debtors', 'debugs', 'debuts', 'decades', 'decals', 'declines', 'decors', 'defaults', 'defeats', 'defects', 'delis', 'demons', 'demos', 'denims', 'dentists', 'depots', 'descents', 'deserts', 'designs', 'desires', 'desserts', 'devils', 'diapers', 'dices', 'dickies', 'diets', 'digits', 'dildos', 'dinars', 'diners', 'diodes', 'discos', 'discuss', 'dishes', 'displays', 'disputes', 'divas', 'divers', 'dives', 'divides', 'dockets', 'dodgers', 'doings', 'domains', 'donors', 'donuts', 'doses', 'doubles', 'downstairs', 'dozens', 'drags', 'dramas', 'drawers', 'droppings', 'dryers', 'dudes', 'dungeons', 'duos', 'dwellings', 'earnings', 'earrings', 'earthquakes', 'eases', 'echoes', 'edges', 'edits', 'educations', 'effects', 'efforts', 'elders', 'elects', 'elites', 'employs', 'empress', 'encores', 'endings', 'ensures', 'entails', 'entires', 'entrants', 'entries', 'enzymes', 'eras', 'escorts', 'essays', 'esteems', 'ethics', 'exams', 'excerpts', 'exempts', 'exhausts', 'exits', 'experts', 'exploits', 'expos', 'extents', 'externs', 'extracts', 'eyebrows', 'fabrics', 'facets', 'facings', 'factions', 'failings', 'failures', 'fairness', 'falcons', 'fares', 'farmers', 'fates', 'fatigues', 'faucets', 'favors', 'favours', 'features', 'feeders', 'feelings', 'fences', 'fenders', 'ferries', 'fetus', 'fibers', 'fictions', 'fighters', 'filenames', 'files', 'finders', 'findings', 'fires', 'fireworks', 'fitness', 'fittings', 'fixes', 'fixings', 'fixtures', 'flames', 'flashers', 'flashlights', 'flavors', 'flavours', 'fleeces', 'florists', 'flyers', 'focus', 'folders', 'footballs', 'foothills', 'footnotes', 'footprints', 'footsteps', 'forecasts', 'forges', 'formats', 'formers', 'fortress', 'foundations', 'founders', 'fowlers', 'fractions', 'fractures', 'fragments', 'frameworks', 'freebies', 'freezers', 'freezes', 'freshness', 'fridges', 'friendships', 'fris', 'frontiers', 'fuels', 'fullers', 'fungus', 'gadgets', 'gages', 'gallons', 'gals', 'games', 'gangbangs', 'garments', 'gaskets', 'gates', 'gateways', 'gathers', 'gauges', 'gazettes', 'gels', 'gemstones', 'genders', 'genius', 'genomes', 'genres', 'gens', 'genus', 'gestures', 'gettings', 'ghettos', 'girlfriends', 'glaciers', 'glances', 'glasses', 'globes', 'goddess', 'goggles', 'golfers', 'goodies', 'gores', 'gossips', 'gourmets', 'graces', 'graders', 'grades', 'grannies', 'graphics', 'gravels', 'graves', 'greatness', 'greetings', 'grinders', 'groupings', 'growers', 'guidelines', 'guitars', 'gurus', 'habits', 'hackers', 'hairstyles', 'halos', 'hampers', 'handbags', 'handbooks', 'handfuls', 'handlers', 'handles', 'handouts', 'handsets', 'hangers', 'harbors', 'hardbacks', 'hardness', 'harpers', 'hassles', 'hastings', 'hates', 'hatreds', 'havens', 'headaches', 'headers', 'headings', 'headlights', 'headlines', 'headphones', 'headsets', 'healings', 'heaters', 'heavens', 'hectares', 'hellos', 'helmets', 'helpers', 'heralds', 'herbals', 'highlands', 'highlights', 'hinges', 'hirings', 'hobbies', 'holders', 'hollands', 'hollows', 'homelands', 'homeless', 'homers', 'hooters', 'hormones', 'hornets', 'horrors', 'hoses', 'hostess', 'hotels', 'hotties', 'hummers', 'humors', 'humours', 'hunters', 'hurdles', 'husbands', 'huskies', 'hydros', 'hypes', 'ibis', 'icons', 'idols', 'illness', 'impacts', 'implants', 'imports', 'impress', 'imprints', 'improves', 'inches', 'inlets', 'inmates', 'innings', 'inputs', 'insects', 'inserts', 'insights', 'instincts', 'insults', 'intakes', 'intents', 'interns', 'intros', 'invites', 'irons', 'issues', 'jackets', 'jaguars', 'jakes', 'japans', 'jets', 'journeys', 'judgements', 'judges', 'jumpers', 'jurors', 'kayaks', 'kennels', 'kernels', 'keyboards', 'keynotes', 'keywords', 'killings', 'kindness', 'kisses', 'kittens', 'kudos', 'labels', 'ladies', 'lakers', 'lambdas', 'lams', 'landlords', 'landmarks', 'lasers', 'lawsuits', 'lawyers', 'leaders', 'leaflets', 'learners', 'leas', 'leases', 'leathers', 'leavings', 'lectures', 'legends', 'leisures', 'lemmas', 'lenders', 'lenses', 'lesions', 'lessons', 'lettings', 'levers', 'lexis', 'liars', 'liens', 'lifetimes', 'lightings', 'lightweights', 'limes', 'liners', 'linings', 'lipids', 'listings', 'lites', 'litres', 'locales', 'lockers', 'lodgings', 'loggings', 'logos', 'loris', 'losers', 'lotions', 'lottos', 'lumbers', 'lunches', 'lures', 'lyrics', 'macs', 'madness', 'magnets', 'mailings', 'mainstreams', 'makings', 'males', 'mamas', 'mammals', 'mandates', 'manners', 'manors', 'mans', 'mappings', 'marbles', 'margins', 'markers', 'mars', 'martens', 'marvels', 'masses', 'matches', 'mates', 'mattress', 'mayors', 'meanings', 'measles', 'melons', 'memoirs', 'memos', 'mentions', 'menus', 'mercers', 'meres', 'mergers', 'metres', 'metrics', 'metros', 'midis', 'migrants', 'miles', 'milestones', 'millers', 'millions', 'miners', 'minis', 'minutes', 'miss', 'missiles', 'mistakes', 'mixers', 'mixes', 'mixtures', 'models', 'modems', 'modes', 'modules', 'monies', 'monos', 'monsters', 'morales', 'mores', 'moses', 'motels', 'motifs', 'mountings', 'movements', 'movers', 'mowers', 'murals', 'murders', 'murrays', 'musings', 'mustangs', 'mutants', 'myrtles', 'napkins', 'nations', 'neglects', 'neighbors', 'neighbours', 'networks', 'neurons', 'nexus', 'nicknames', 'nightmares', 'nipples', 'noises', 'noodles', 'noses', 'notebooks', 'nothings', 'notions', 'novels', 'nudists', 'nuggets', 'numbers', 'nurses', 'nylons', 'obliques', 'obscures', 'offsets', 'offsprings', 'okays', 'oldies', 'onsets', 'optics', 'options', 'opus', 'orbits', 'orchids', 'ores', 'orgasms', 'orgies', 'orphans', 'ounces', 'outbreaks', 'outcomes', 'outdoors', 'outfits', 'outings', 'outlets', 'outlines', 'outlooks', 'outputs', 'outskirts', 'ovens', 'overs', 'owners', 'oxides', 'pacers', 'paces', 'packers', 'packets', 'padres', 'pagans', 'painters', 'paintings', 'palmers', 'pamphlets', 'pans', 'panthers', 'papas', 'parades', 'paras', 'parcels', 'parents', 'parkways', 'paroles', 'pars', 'parsers', 'parses', 'partners', 'pass', 'passports', 'passwords', 'pastas', 'pastors', 'patents', 'pathways', 'patients', 'patricks', 'patterns', 'pauses', 'pavements', 'paydays', 'payers', 'payments', 'peanuts', 'peasants', 'pedals', 'pedros', 'pellets', 'pencils', 'pendants', 'penguins', 'peoples', 'percents', 'perfumes', 'permits', 'pesos', 'phones', 'phonics', 'phosphates', 'photons', 'physics', 'pianos', 'pieces', 'pipelines', 'pipers', 'pirates', 'pitfalls', 'pixels', 'pizzas', 'placements', 'plaintiffs', 'planes', 'planters', 'plates', 'playas', 'playbacks', 'playboys', 'playgrounds', 'plazas', 'pledges', 'pliers', 'plumbers', 'poems', 'pointers', 'pointings', 'polos', 'polys', 'portions', 'portraits', 'poses', 'poss', 'postcards', 'postings', 'postscripts', 'pouches', 'praises', 'praxis', 'prayers', 'premieres', 'premiers', 'presents', 'preserves', 'presidents', 'pressings', 'previews', 'primates', 'primers', 'printers', 'prisons', 'privates', 'probates', 'probes', 'problems', 'proceeds', 'process', 'products', 'programs', 'progress', 'projects', 'prophets', 'proses', 'prospects', 'prostates', 'proteins', 'protests', 'proverbs', 'proxies', 'pumas', 'pumpkins', 'pundits', 'pupils', 'puppets', 'purses', 'pursuits', 'pussies', 'puzzles', 'quarters', 'quartets', 'queries', 'quiets', 'quotas', 'rabbis', 'racers', 'racists', 'rages', 'raiders', 'railroads', 'railways', 'rainfalls', 'raises', 'ranchos', 'ranges', 'rankings', 'rapes', 'raptors', 'ratings', 'ratios', 'ravens', 'razors', 'reaches', 'readers', 'reasons', 'rebates', 'rebels', 'rebounds', 'recalls', 'receipts', 'recess', 'records', 'recruits', 'reeboks', 'refers', 'refills', 'regards', 'regents', 'regimes', 'regions', 'regrets', 'rejects', 'reloads', 'remains', 'remarks', 'remnants', 'removes', 'renders', 'rentals', 'renters', 'repairs', 'repeats', 'replays', 'replies', 'reprints', 'reptiles', 'rescues', 'resets', 'resins', 'resists', 'resolves', 'respects', 'responds', 'restarts', 'results', 'resumes', 'retails', 'retreats', 'retrieves', 'retros', 'reveals', 'rewards', 'riches', 'richness', 'riders', 'ridges', 'rifles', 'rippers', 'rites', 'rivals', 'rollers', 'romas', 'rookies', 'rosters', 'roulettes', 'routers', 'routes', 'routines', 'routings', 'rovers', 'ruins', 'rulers', 'rulings', 'rumours', 'rupees', 'sadness', 'safeguards', 'sagas', 'sages', 'sakes', 'sambas', 'samplers', 'samples', 'samplings', 'sandals', 'sanders', 'sauces', 'saunas', 'savers', 'savings', 'sayings', 'scandals', 'scanners', 'schedules', 'scholars', 'schoolgirls', 'schoolings', 'scientists', 'scooters', 'scopes', 'scratches', 'screenings', 'sculptures', 'seatings', 'seconds', 'sectors', 'seedlings', 'seekers', 'segments', 'seizures', 'sellers', 'semis', 'senders', 'sensors', 'sequels', 'series', 'sermons', 'servants', 'servers', 'servings', 'sessions', 'settlers', 'sevens', 'sewers', 'shades', 'shakers', 'shallows', 'shames', 'shampoos', 'sheilas', 'shipments', 'shooters', 'shoppers', 'shortcuts', 'showers', 'showings', 'shutters', 'siblings', 'sidewalks', 'silvas', 'singles', 'sinners', 'sinus', 'sisters', 'sixties', 'sizes', 'skates', 'sketches', 'skies', 'slates', 'slices', 'slogans', 'smokers', 'snapshots', 'sneakers', 'snippets', 'solvents', 'somethings', 'sonics', 'spacings', 'spankings', 'speakers', 'species', 'spirals', 'spoilers', 'sponsors', 'spotlights', 'spouses', 'squeezes', 'stances', 'staples', 'starters', 'statics', 'steroids', 'stickers', 'stiffness', 'stitches', 'stores', 'strangers', 'stratus', 'stresses', 'stretches', 'strippers', 'strollers', 'structures', 'studies', 'stupids', 'stylus', 'subclass', 'subgroups', 'subsets', 'substrates', 'suburbs', 'subways', 'success', 'suites', 'summons', 'sunsets', 'supers', 'supplies', 'supports', 'surfers', 'surges', 'surnames', 'surplus', 'surrounds', 'surveys', 'suspects', 'sweepstakes', 'sweetness', 'swingers', 'switchboards', 'switches', 'symbols', 'symptoms', 'syndromes', 'syrups', 'systems', 'tablets', 'taboos', 'tackles', 'tactics', 'tailors', 'takings', 'tales', 'taras', 'tariffs', 'tarots', 'tastings', 'tattoos', 'taxis', 'teachers', 'teaches', 'technics', 'techniques', 'tellings', 'templates', 'tempos', 'tenders', 'tensions', 'tenures', 'terrains', 'terrors', 'testers', 'textbooks', 'textiles', 'textures', 'thesis', 'thickness', 'thinkers', 'thinkings', 'threesomes', 'thresholds', 'thrillers', 'thumbnails', 'tidbits', 'tiers', 'tiles', 'timers', 'timings', 'titties', 'todays', 'toddlers', 'tones', 'torches', 'torques', 'torrents', 'tortures', 'totes', 'tourists', 'tours', 'townships', 'toxins', 'trackers', 'tractors', 'trademarks', 'traders', 'trades', 'trainees', 'trainers', 'trainings', 'trances', 'transcripts', 'transforms', 'transients', 'transits', 'transplants', 'traumas', 'treadmills', 'treatments', 'tribunes', 'tributes', 'tripods', 'triumphs', 'troopers', 'trophies', 'tropics', 'trousers', 'trumpets', 'trustees', 'tubes', 'tubings', 'tumors', 'tuners', 'tunes', 'turbines', 'turbos', 'turners', 'turtles', 'tutors', 'tylers', 'typings', 'typos', 'ulcers', 'uniques', 'unis', 'updates', 'upgrades', 'upsets', 'upstairs', 'urges', 'users', 'uses', 'vaccines', 'vanguards', 'vapors', 'vases', 'vegas', 'vendors', 'vents', 'venues', 'verdicts', 'verses', 'vessels', 'victims', 'viewers', 'viewings', 'viewpoints', 'vikings', 'villains', 'villas', 'vineyards', 'virtues', 'virus', 'visas', 'visions', 'visits', 'vistas', 'vitals', 'voices', 'volumes', 'voters', 'vouchers', 'voyeurs', 'waitress', 'waivers', 'wallets', 'walnuts', 'warners', 'warnings', 'washers', 'watchers', 'waters', 'wavelengths', 'weakness', 'weapons', 'wears', 'weavers', 'wedges', 'weekdays', 'weekends', 'welcomes', 'wellness', 'westerns', 'wheelers', 'whirlpools', 'whispers', 'wholesales', 'widgets', 'winners', 'wizards', 'womans', 'woodlands', 'workers', 'workshops', 'wrappers', 'wrappings', 'wrinkles', 'writers', 'writings', 'yens', 'youngsters', 'zombies'];
var cookies;
const app = express()

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(cors())
app.use(cookieSession({
  name: 'session',
  signed: false,
  maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
}))

app.get('/', (req,res) => {
	res.render('puzzle', {image: {'name':'padres.gif','width':'900','height':'500'}})
})
app.get('/puzzles/*', (req,res) => {
	var username = 'anonuser';
	if (req.session && req.session.username){
		username = req.session.username;
	}
	res.render('puzzles/'+req.path.replace('/puzzles/','').replace('.html','.ejs'),{'username':username});
})
app.post('/save/*', (req,res) => {
	var username = 'anonuser';
	if (req.session && req.session.username){
		username = req.session.username;
	}
	res.render('puzzles/'+req.path.replace('/puzzles/','').replace('.html','.ejs'),{'username':username});
})

app.get('/profile', function (req, res){
	var username = '';
	var user = {};
	user['name']='First Last';
	user['puzzles_created']=[];
	user['puzzles_progress']=[];
	if (req.query.user){
		username = req.query.user;
		connection.query('SELECT puzzle_link, puzzle_section FROM '+username+'', function (error, results, fields) {
		  if (error) { 
		  	
		  }
		  else {
		  	for (var i=0;i<results.length;i++) {
		  		if (results[i].puzzle_section == 'created') {
		  			user['puzzles_created'].push(results[i].puzzle_link+'.html');
		  		}
		  		else if (results[i].puzzle_section == 'progress') {
		  			user['puzzles_progress'].push(results[i].puzzle_link+'.html');
		  		}
		  	}
		  	res.render('profile', user);
		  }
		});
	}
	
    
});

app.get('/create-profile', function (req, res){
    res.render('create-profile', {'message':''});
});
app.post('/create-profile', function (req, res){

	var form = new formidable.IncomingForm();
	var myfields = {};
	form.parse(req, function(err, fields, files) {
      myfields = fields;
    });
	form.on('end', function() {
		if (myfields.username && myfields.username.length > 2) {
			connection.query('SELECT 1 FROM '+myfields.username+' LIMIT 1;', function (error, results, fields) {
			  if (error) { 
				connection.query('CREATE TABLE '+myfields.username+' (puzzle_link VARCHAR(100), puzzle_gif VARCHAR(100), last_access TIMESTAMP, puzzle_section VARCHAR(30), user_progress JSON );', function (error, results, fields) {if (error) {console.log('error in mysql creating table')};});
				try {
					req.session.username = myfields.username;
				}
				catch {
					console.log('error creating cookie for username');
				}
				res.redirect('profile?user='+myfields.username);
			  }
			  else {
				console.log('Username exists!');
				res.render('create-profile', {'message':'Username already exists!'});
			  }
			});
		}
		else {
			res.render('create-profile', {'message':'Username must be at least 3 characters!'});
		}
		
	});
});

app.get('/upload', function (req, res){
    res.render('upload');
});
app.post('/upload', function (req, res){
    var form = new formidable.IncomingForm();
	var npieces = 0;
	var gametype = 'solo';
	var players = 'one';
	var score = false;
	var nfound = 0;
	var fname = '';
	var fullname = '';
	form.on('field', function(name, value) {
		if (name == 'pieces'){npieces = value; nfound++;}
		if (name == 'gametype'){gametype = value; nfound++;}
		if (name == 'players'){players = value; nfound++;}
		if (name == 'score'){if (value == 'points'){score = true;}; nfound++;}
		
	});
	
    form.parse(req);
	
    form.on('fileBegin', function (name, file){
    	
    	const extension = file.name.substr(file.name.lastIndexOf("."),);
    	if (extension.length > 0){
			var retval = makename(extension);
			fullname = retval[1];
			fname = retval[0];
			file.path = __dirname + '/public/gifs/' + fullname;
			nfound++;
        }

        
    });

    form.on('file', function (name, file){});
    
    form.on('end', function(name, value) {
    	try {
    		if (nfound>=5){
				var dimensions = sizeOf('public/gifs/' + fullname);
				var retval = makelines(dimensions.width,dimensions.height,npieces);
				ejs.renderFile('views/encryptedpuzzle.ejs', {gametype: gametype, players: players, score: score, npieces: retval[6],pagename: fname,image: {'name':'../gifs/'+fullname,'width':dimensions.width,'height':dimensions.height}, 'vclines':JSON.stringify(retval[7]), 'hclines':JSON.stringify(retval[8]), 'ccenters':JSON.stringify(retval[9]), 'vlines':retval[0], 'hlines':retval[1], 'centers':JSON.stringify(retval[2]), 'locations':JSON.stringify(retval[3]), 'rotations':JSON.stringify(retval[4]), 'matches':JSON.stringify(retval[5])})
				.then(function (fulfilled) {
					fs.writeFile('views/puzzles/'+fname+'.ejs',fulfilled.replace('anonuser','<%= username %>'), function(err) {
						if(err) {
							res.render('upload',{'message':'Try a different image!'});
							return console.log(err);
						}

					}); 
					if (req.session && req.session.username){
						connection.query("INSERT INTO "+req.session.username+" VALUES ('"+fname+"', '"+fullname+"', NOW(), 'created', '{}');", function (error, results, fields) {if (error) {console.log('error in adding data to user table.')};});
					}
					else if (req.session){
						console.log('no username');
					}

					connectionP.query("INSERT INTO summary VALUES ('"+fname+"', '"+fullname+"', 0, NOW(), "+npieces+", '', '', '', '', '', '"+gametype+"', 'pieces', "+0.0+", "+0.0+", '{}', '' );", function (error, results, fields) {if (error) {console.log('error in adding data to puzzle summary table.');console.log(error);};});

					return res.redirect('puzzles/'+fname+'.html');
				})
				.catch(function (error) {
					console.log(error.message);
					res.render('upload',{'message':'Try a different image!'});
				});
			}
			else {
				res.render('upload',{'message':'Include a file!'});
			}

        }
        catch (e){
        	console.log(e);
        	res.render('upload',{'message':'Error! Try again?'});
        }
    });

});

app.get('/uploada', function (req, res){
    res.render('upload')
});
app.post('/uploada', function (req, res){
    var form = new formidable.IncomingForm();
	var npieces = 0;
	var gametype = 'solo';
	var players = 'one';
	var url = '';
	var score = false;
	var nfound = 0;
	var fname = '';
	var fullname = '';
	
	form.on('field', function(name, value) {
		if (name == 'pieces'){npieces = value; nfound++;}
		if (name == 'gametype'){gametype = value; nfound++;}
		if (name == 'players'){players = value; nfound++;}
		if (name == 'score'){if (value == 'points'){score = true;}; nfound++;}
		if (name == 'url'){
			if (value.length > 0) {
				url = value;
				nfound++;
			}
		}
		
		
		if (nfound>=5){
			console.log(fullname);
			var extension = url.substr(url.lastIndexOf("."),);
			var retval = makename(extension);
			fullname = retval[1];
			fname = retval[0];
			console.log(downloadfile(url,fullname,npieces,gametype,players,score,fname));
			

			
		}
	});
	
    form.parse(req);
	
    

});

server = app.listen(3000)

var merges = {};

const io = require('socket.io')(server)
io.on('connection', (socket) => {
	socket.username = socket.id;

	console.log(socket.handshake.query.username);
	socket.join(socket.handshake.query.name);
	socket.room = socket.handshake.query.name;
	if (!merges[socket.room]) {merges[socket.room]=[];}
	socket.emit('new_user',{'merges':merges[socket.room],'username':socket.username});
	
	socket.on('disconnect', (data) => {
		console.log('dconnect');
	})
	
	socket.on('merge_pieces', (data) => {
		data['username']=socket.username;
		socket.broadcast.to(socket.room).emit('merge_pieces', data);
		merges[socket.room].push(data);
	})
	
	socket.on('game_over', (data) => {
		var users = [];
		var npieces = 1;
		var ntime = 3;
		for (var i=0;i<merges[socket.room].length;i++){
			npieces +=1;
			let username = merges[socket.room][i].username;
			var userexists = false;
			for (var ii=0;ii<users.length;ii++){
				if (username == users[ii]){
					userexists = true;
					break;
				}
			}
			if (!userexists) {
				users.push(username);
			}
		}
		delete merges[socket.room];
		io.sockets.in(socket.room).emit('game_over', {'message': users.length+' users connected '+npieces+' pieces in '+ntime+' minutes!'});
	})
})






function makename(extension){
	fname = (Math.floor(Math.random()*8)+2)+'-'+adjectives[Math.floor(Math.random()*813)]+'-'+nouns[Math.floor(Math.random()*2210)];
	for (var i=0;i<20;i++) {
		var isAvailable = fs.access('/public/gifs/'+fname+extension, fs.F_OK, (err) => {
		  if (err) {
			return 1;
		  }
		  fname = (Math.floor(Math.random()*9)+1)+fname;
		  return 0;
		})
		if (isAvailable == 1) {break;}
	}
	fullname = fname+extension;
	return [fname,fullname];
}

function downloadfile(file_url,fullname,npieces,gametype,players,score,fname) {

	var DOWNLOAD_DIR = 'public/gifs/';

	var options = {
		host: url.parse(file_url).host,
		port: 80,
		path: url.parse(file_url).pathname
	};

	var file = fs.createWriteStream(DOWNLOAD_DIR + fullname);
	var resurl = '';
	http.get(options, function(res) {
		res.on('data', function(data) {
			file.write(data);
		}).on('end', function() {
				file.end();
				var dimensions = sizeOf('public/gifs/' + fullname);
				var retval = makelines(dimensions.width,dimensions.height,npieces);
				ejs.renderFile('views/puzzle.ejs', {gametype: gametype, players: players, score: score, npieces: retval[6],pagename: fname,image: {'name':'../gifs/'+fullname,'width':dimensions.width,'height':dimensions.height}, 'vclines':retval[7], 'hclines':retval[8], 'ccenters':JSON.stringify(retval[9]), 'vlines':retval[0], 'hlines':retval[1], 'centers':JSON.stringify(retval[2]), 'locations':JSON.stringify(retval[3]), 'rotations':JSON.stringify(retval[4]), 'matches':JSON.stringify(retval[5])}).then(function (fulfilled) {
				fs.writeFile('public/puzzles/'+fname+'.html',fulfilled, function(err) {
					if(err) {
						return console.log(err);
					}

					console.log("The file was saved!");
				}); 
				return 'puzzles/'+fname+'.html';
			})
			.catch(function (error) {
				console.log(error.message);
			});
		});
	});
	


}



function makelines(width,height,npieces) {
	var vlines = [];
	var hlines = [];
	var vclines = [];
	var hclines = [];
	var ccenters = [];
	var x = [];
	var y = [];
	var xx = [];
	var yy = [];
	var centers = [];
	var locations = [];
	var rotations = [];
	var matches = {};
	let nrowsf = Math.floor(Math.sqrt(npieces*height/width));
	let ncolsf = Math.floor(nrowsf*width/height);
	var nrows = nrowsf;
	var ncols = ncolsf;
	var mind = npieces*2;
	for (var i=0;i<2;i++) {
		for (var ii=0;ii<2;ii++) {
			if (Math.abs(npieces-(nrows+i)*(ncols+ii))<mind){
				mind = Math.abs(npieces-(nrows+i)*(ncols+ii));
				nrows = nrows+i;
				ncols = ncols+ii;
			}
		}
	}

	width = 512/(276*2+512); //Revert to 1
	height = 144/164; //Revert to 1
	
	
	const xchoices = [-1*width/ncols*.25,-1*width/ncols*.15,width/ncols*.15,width/ncols*.25];
	const ychoices = [-1*height/nrows*.25,-1*height/nrows*.15,height/nrows*.15,height/nrows*.25];
	var conversions = {};
	for (var i=0;i<ncols+1;i++){
		x.push(width/(ncols)*i);
		xx.push(xchoices[Math.floor(Math.random()*4)]);
	}
	for (var i=0;i<nrows+1;i++){
		y.push(height/(nrows)*i);
		yy.push(ychoices[Math.floor(Math.random()*4)]);
	}
	for (var i=0;i<nrows*ncols;i++){
		
		if (i%6<3){ //Delete conversions
			conversions['video'+i]=[276/(276*2+512),Math.floor(i/(2*ncols))*(.5+20/164/2),i%3,Math.floor(i/(ncols))%2];
		}
		else{
			conversions['video'+i]=[20/(276*2+512),Math.floor(i/(2*ncols))*(.5+20/164/2),i%3,Math.floor(i/(ncols))%2];
		}
		const xdist = [xx[i%ncols],xx[i%ncols+1]];
		const ydist = [yy[Math.floor(i/ncols)+1],yy[Math.floor(i/ncols)]];
		
		const x0 = conversions['video'+i][0]+conversions['video'+i][2]*width/ncols;
		const y0 = conversions['video'+i][1]+conversions['video'+i][3]*height/(nrows);
		const x1 = x0+width/ncols;
		const y1 = y0+height/(nrows);
		//var line1 = x[i%ncols]+','+y[Math.floor(i/ncols)]+' '+x[i%ncols]+','+(y[Math.floor(i/ncols)+1]+y[Math.floor(i/ncols)]*2)/3+' '+(x[i%ncols]+xdist[0])+','+(y[Math.floor(i/ncols)+1]+y[Math.floor(i/ncols)]*1)/2+' '+x[i%ncols]+','+(y[Math.floor(i/ncols)+1]*2+y[Math.floor(i/ncols)])/3+' '+x[i%ncols]+','+y[Math.floor(i/ncols)+1]+' '
		//var line2 = x[i%ncols+1]+','+(y[Math.floor(i/ncols)+1]*2+y[Math.floor(i/ncols)]*1)/3+' '+(x[i%ncols+1]+xdist[1])+','+(y[Math.floor(i/ncols)+1]+y[Math.floor(i/ncols)]*1)/2+' '+x[i%ncols+1]+','+(y[Math.floor(i/ncols)+1]*1+y[Math.floor(i/ncols)]*2)/3+' '+x[i%ncols+1]+','+y[Math.floor(i/ncols)]+' '

		//if (i%ncols>=0){ //Revert to equality and remove conversions
		//	line1 = (x[0]+conversions['video'+i][0]*cwidth)+','+y[Math.floor(i/ncols)]+' '+(x[0]+conversions['video'+i][0]*cwidth)+','+y[Math.floor(i/ncols)+1]+' '
		//}
		//if (i%ncols<=ncols-1){ //Revert to equality and remove conversions
		//	line2 = (x[ncols]+conversions['video'+i][0]*cwidth)+','+y[Math.floor(i/ncols)]+' '
		//}
		var line1 = x0+','+y0+' '+x0+','+y1+' ';
		var line2 = x1+','+y0+' ';

		vlines.push([line1,line2])

		//line1 = (x[i%ncols]*2+x[i%ncols+1]*1)/3+','+y[Math.floor(i/ncols)+1]+' '+(x[i%ncols]+x[i%ncols+1]*1)/2+','+(y[Math.floor(i/ncols)+1]+ydist[0])+' '+(x[i%ncols]*1+x[i%ncols+1]*2)/3+','+y[Math.floor(i/ncols)+1]+' '+x[i%ncols+1]+','+y[Math.floor(i/ncols)+1]+' '
		//line2 = (x[i%ncols+1]*2+x[i%ncols]*1)/3+','+y[Math.floor(i/ncols)]+' '+(x[i%ncols]+x[i%ncols+1]*1)/2+','+(y[Math.floor(i/ncols)]+ydist[1])+' '+(x[i%ncols]*2+x[i%ncols+1]*1)/3+','+y[Math.floor(i/ncols)]+' '+x[i%ncols]+','+y[Math.floor(i/ncols)]+' '
	
		//if (Math.floor(i/ncols)>=0){//Revert to equality and remove conversions
		//	line2 = (x[i%ncols]+conversions['video'+i][0]*cwidth)+','+y[0]+' '
		//}
		//if (Math.floor(i/ncols)<=nrows-1){//Revert to equality and remove conversions
		//	line1 = (x[i%ncols+1]+conversions['video'+i][0]*cwidth)+','+y[nrows]+' '
		//}
		line2 = x0+','+y0+' ';
		line1 = x1+','+y1+' ';

		hlines.push([line1,line2])

		centers.push([[(x0+x1)/2,(y0+y1)/2]]);
		
		const x0c = 552/(276*2+512)+(i%ncols)*512/(276*2+512)/ncols;
		const y0c = Math.floor(i/ncols)*288/328/(nrows);
		const x1c = x0c+512/(276*2+512)/ncols;
		const y1c = y0c+288/328/(nrows);

		var line1c = x0c+','+y0c+' '+x0c+','+y1c+' ';
		var line2c = x1c+','+y0c+' ';

		vclines.push([line1c,line2c])
		line2c = x0c+','+y0c+' ';
		line1c = x1c+','+y1c+' ';

		hclines.push([line1c,line2c])

		ccenters.push([(x0c+x1c)/2,(y0c+y1c)/2]);
	}
	
	for (var i=0;i<ncols*nrows;i++){
		locations.push([Math.floor(Math.random()*600),10+Math.floor(Math.random()*300)])
	}

	for (var i=0;i<ncols*nrows;i++){
		//rotations.push(Math.floor(Math.random()*4)*90)
		rotations.push(0)
	}
	for (var ii=0;ii<ncols*nrows;ii++){
		var i = parseInt(ii);
		matches['video'+(i+1)]=[];
		if (i%ncols<ncols-1){
			matches['video'+(i+1)].push(['video'+(i+2),'left'])
		}
		if (i%ncols>0){
			matches['video'+(i+1)].push(['video'+(i),'right'])
		}
		if (Math.floor(i/ncols)<nrows-1){
			matches['video'+(i+1)].push(['video'+(i+1+parseInt(ncols)),'top'])
		}
		if (Math.floor(i/ncols)>0){
			matches['video'+(i+1)].push(['video'+(i+1-parseInt(ncols)),'bottom'])
		}
	}
	return [vlines,hlines,centers,locations,rotations,matches,nrows*ncols,vclines,hclines,ccenters];
}