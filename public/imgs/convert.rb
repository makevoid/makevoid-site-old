
def resize(dir, src, dest)
  convert = "/opt/local/bin/convert"
  cmd = "cd #{dir}; #{convert} #{src} -resize 600x450 -gravity north #{dest}"
  puts "executing: #{cmd}"
  puts `#{cmd}`
end

path = File.expand_path "../", __FILE__
Dir.glob(/#{path}\/projects\/*.(png|jpg|svg)/).each do |file|
  resize "home", file, file 
end
