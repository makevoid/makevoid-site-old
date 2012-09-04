require 'haml'
require 'sass'
require 'sinatra/base'
require 'json'

path = File.expand_path "../", __FILE__
APP_PATH = path

class Makevoid < Sinatra::Base
  require "#{APP_PATH}/config/env"

  configure :development do
    set :public_folder, "public"
    set :static, true
  end
  set :logging, true

  set :haml, { :format => :html5 }
  enable :sessions
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
    not_found unless idx
    # datas.sort{ |a, b| (datas.index(a) > idx) ? -1 : 1  }
    data = datas[idx]
    datas.delete_at idx
    # datas.unshift data
    datas.insert 2, data
    datas
  end

  #MKVD_FORMAT = "svg"
  MKVD_FORMAT = "png"

  def get_datas(page=nil)
    datas = [
      { name: "Elisabetta Porcinai",  template: "eli" },
      { name: "Worked for",           template: "non_open" },
      { name: "RiotVan",              template: "riotvan" },
      { name: "makevoid",             template: "makevoid" },

      { name: "FiveTastic",           template: "fivetastic" },
      { name: "Accademia Cappiello",  template: "cappiello" },

      { name: "Whoisy",               template: "whoisy" },
      { name: "Pietro Porcinai",      template: "pp" },
      #{ name: "my open source projects on github", template: "github_projects" },
      { name: "jScrape",              template: "jscrape" },
      { name: "Thorrents",            template: "thorrents" },
      { name: "MangaPad",             template: "mangapad" },
      { name: "SkiCams",              template: "skicams" },
      #{ name: "StyleQuiz", template: "stylequiz" },
    ]
    datas.each do |data|
      frmt = data[:template] == "makevoid" ? MKVD_FORMAT : "png"
      data[:image] = "/imgs/projects/#{data[:template]}.#{frmt}"
    end

    datas = order_datas(datas, page) if page

    @gallery_datas = datas
    @gallery_json = datas.to_json
  end

  get "/" do
    get_datas
    @entry = @gallery_datas.find{ |pag| pag[:template] == "makevoid" }
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
    splat = splat.gsub(/ /, '+')
    redirect "http://updates.makevoid.com/posts/#{splat}"
  end

  get "/*" do |page|
    get_datas(page)
    @entry = @gallery_datas.find{ |e| e[:template] == page }
    haml :index
  end

end