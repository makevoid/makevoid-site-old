require 'haml'
require 'sass'
require 'sinatra/base'
require "sinatra/reloader"
require 'json'

path = File.expand_path "../", __FILE__
APP_PATH = path

class Makevoid < Sinatra::Base
  require "#{APP_PATH}/config/env"
  
  configure :development do
    register Sinatra::Reloader
    also_reload ["controllers/*.rb", "models/*.rb", "public/projects/*.haml"]
    set :public, "public"
    set :static, true
  end
  
  set :haml, { :format => :html5 }
  require 'rack-flash'
  enable :sessions
  use Rack::Flash
  require 'sinatra/content_for'
  helpers Sinatra::ContentFor
  set :method_override, true

  def not_found(object=nil)
    halt 404, "404 - Page Not Found"
  end
  
  helpers do
    def js_void
      "javascript:void(0)"
    end
  end

  def order_datas(datas, page)
    values = datas.map{ |d| d[:template] }
    idx = values.index(page)
    # datas.sort{ |a, b| (datas.index(a) > idx) ? -1 : 1  } 
    data = datas[idx]
    datas.delete_at idx
    datas.unshift data
    datas
  end

  def get_datas(page=nil)
    datas = [
      { name: "makevoid", template: "makevoid" },
      { name: "Accademia Cappiello", template: "cappiello" },
      { name: "Pietro Porcinai", template: "pp" },
      { name: "Elisabetta Porcinai", template: "eli" },
      #{ name: "my open source projects on github", template: "github_projects" },
      { name: "jScrape", template: "jscrape" },
      { name: "Thorrents", template: "thorrents" },
      { name: "MangaPad", template: "mangapad" },
      { name: "Skicams", template: "skicams" },
    ]
    datas.each{ |data| data[:image] = "/imgs/home/#{data[:template]}.png" }
    
    datas = order_datas(datas, page) if page
    
    @gallery_datas = datas
    @gallery_json = datas.to_json
  end

  get "/" do
    get_datas
    @entry = @gallery_datas.first
    haml :index
  end

  get '/css/main.css' do
    sass :main
  end
  
  get "/*" do |page|
    get_datas(page)
    @entry = @gallery_datas.find{ |e| e[:template] == page }
    haml :index
  end

  
end