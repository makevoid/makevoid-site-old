require 'bundler'
require 'bundler/setup'



# require 'dm-core'
# require 'dm-sqlite-adapter'
# 
# DataMapper.setup :default, "sqlite://#{APP_PATH}/db/app.sqlite"
# 
# 
# Dir.glob("#{APP_PATH}/models/*").each do |model|
#   require model
# end


require 'voidtools'
include Voidtools::Sinatra::ViewHelpers
require 'voidtools/sinatra/tracking'
include Voidtools::Tracking
