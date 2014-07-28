#! /usr/bin/ruby -w

#Represents a Rogerian psychiatrist
$count=0
class Shrink
  
  #initializes 'memory' of Eliza.
  def initialize()
    @he="he"
    @she="she"
    @they="they"
    
  end

  #read a statement and convert it to a psychiatric response.
  def generateResponse(blather)
    #downcase for ease of substitution
    blather = blather.downcase
    
    if blather.include? "can you stop asking me questions?"
        $count = 1
    end
    if blather.include? "yes" and  $count == 1
        $count = 2
    end
    if blather.include? "you are annoying" and $count == 2
        puts "Oh. Well. Im sorry. Ill catch you later. Bye :)"
        return
    end

    blather.sub!(/\bare\b\s\byou\b/, 'IS IT IMPORTANT IF I AM')

    #change 'you', 'your', etc. to uppercase 'I', 'MY'
    blather.gsub!(/\byour\b/,"MY")
    blather.gsub!(/\byou\b/,'I')

    #Replace 'my' with 'your', 'me' with 'you', 'I' with 'you', etc.
    blather.gsub!(/\bmy\b/,"your")
    blather.gsub!(/\bme\b/,"you")
    blather.gsub!(/\bi\b/,'you')

    #Sub in past references, but only for the 1st occurrence or it looks weird
    blather.sub!(/\b(he|him)\b/, @he)
    blather.sub!(/\b(she|her)\b/, @she)
    blather.sub!(/\b(they)\b/, @they)

    #Get future references -- note that these do NOT change the immediate output
    hePat=/.*\b(your (father|brother|(ex-?)?(husband|boyfriend)))\b.*/
    shePat = /.*\b(your (mother|sister|(ex-?)?(wife|girlfriend)))\b.*/
    theyPat = /.*\b(your parents)\b.*/
    @he=blather.sub(hePat, '\1').chomp if blather =~ hePat 
    @she=blather.sub(shePat, '\1').chomp if blather =~ shePat
    @they=blather.sub(theyPat, '\1').chomp if blather =~ theyPat

    #Deal with name
    namePat=/.*\byour name is (\w+).*/
    @name=blather.sub(namePat,'\1')
    blather.sub!(namePat,'nice to meet you, \1.  How can I help you')

    #change 'always', 'never'
    if blather.include? "always" or blather.include? "never"
        puts "CAN YOU BE MORE SPECIFIC?"
    end
    
    blather.gsub!(/\b(well|perhaps)\b,\s/ , "")
        #results are uppercased, for aesthetics.
    return blather.upcase + "?"
  end
end


#main -- reads from standard input unless -test is the first parameter.
eliza = Shrink.new()
if ARGV[0] == "-test"
    ['My girlfriend never listens to me',
     "I think she might be deaf",
     "yes",
     "I am afraid of clowns",
     "Well, they just seem creepy",
     "Also, when I was a kid, a clown killed my dad",
      "Are you a clown in disguise?",
      "My parents never spoke to each other.",
      "They always fight"
    ].each do |stmt|
        puts stmt
        puts eliza.generateResponse(stmt)
    end
else
  while line = gets
    response = eliza.generateResponse line
    puts response
  end
end
