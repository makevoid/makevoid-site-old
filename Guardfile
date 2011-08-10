guard 'livereload' do
  watch(%r{.+\.rb})
  watch(%r{(models|config|lib)/.+\.(rb|yml)})
  watch(%r{views/.+\.(haml|sass)})
  watch(%r{public/.+/.+\.(css|js|html|haml|md|markdown|txt)})
  watch(%r{public/.+\.(css|js|html)})
end

guard 'coffeescript', :input => 'public/js'

# More infos at https://github.com/guard/guard#readme