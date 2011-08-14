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
    also_reload ["controllers/*.rb", "models/*.rb"]
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

  get "/" do
    datas = [
      { name: "Accademia Cappiello", template: "cappiello" },
      { name: "Pietro Porcinai", template: "pp" },
      { name: "Elisabetta Porcinai", template: "eli" },
      { name: "my open source projects on github", template: "github_projects" },
      { name: "Skicams", template: "skicams" },
    ]
    datas.each{ |data| data[:image] = "/imgs/home/#{data[:template]}.png" }
    @gallery_datas = datas.to_json
    haml :index
  end

  get "/updates" do
    redirect "http://updates.makevoid.com"
  end
  
  get "/blog" do
    redirect "http://updates.makevoid.com/blog"
  end
  
  get "/login" do
    redirect "http://updates.makevoid.com/login"
  end

  get "/posts/*" do |splat|
    redirect "http://updates.makevoid.com/posts/#{splat}"
  end

  get '/css/main.css' do
    sass :main
  end
  
end