#!/usr/bin/ruby

require 'http'
require 'yaml'
require 'date'
require 'parallel'

CONFIG = YAML.load_file('config.yml')
ISO8601 = '%Y-%m-%d'

def getImageByDate(date)
    return HTTP.get(
      CONFIG['baseUrl'],
      :params => {
        :api_key => CONFIG['API_KEY'],
        :date => date,
        :hd => true
      }
    )
end

def downloadImage(url)
    return HTTP.get(url)
end

def beginProcess
  imageQueue = []
  indexDate = CONFIG['start']
  finalDate = DateTime.now().strftime(ISO8601)

  while indexDate.strftime(ISO8601) != finalDate
    apodData = JSON.parse(getImageByDate(indexDate))

    unless apodData['code'] == 500
      puts "Added to queue: #{apodData['url']}. Dated #{indexDate.strftime(ISO8601)}"
      imageQueue.push(apodData['url'])
    else
      puts "Error grabbing image for date #{indexDate.strftime(ISO8601)}"
    end

    if imageQueue.length === CONFIG['maxParallel']
      Parallel.map(imageQueue, in_threads: CONFIG['maxParallel']) do |url|
        downloadImage(url)
      end
      imageQueue.clear
    end

    indexDate = indexDate + 1
    sleep(3)
  end
end

beginProcess()

