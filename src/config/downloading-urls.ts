export const downloadUrls = {
  windows: {
    url: 'https://github.com/Sazzad-Anwar/connector/releases/download/v2.0.0/connector_2.0.0_x64-setup.exe',
  },
  mac: {
    url: 'https://github.com/Sazzad-Anwar/connector/releases/download/v2.0.0/connector_2.0.0_x64.dmg',
  },
  linux: {
    url: 'https://github.com/Sazzad-Anwar/connector/releases/download/v2.0.0/connector_x64.app.tar.gz',
  },
}

export const downloadFromUrl = async (
  platform: 'windows' | 'mac' | 'linux',
) => {
  const response = await fetch(
    'https://corsproxy.io/?' + downloadUrls[platform].url,
  )
  const blob = await response.blob()
  const downloadUrl = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = downloadUrl
  link.download = `connector_${platform}_2.0.0.${
    platform === 'windows' ? 'exe' : platform === 'mac' ? 'dmg' : 'tar.gz'
  }`
  link.style.display = 'none'
  document.body.appendChild(link)

  link.click()
  setTimeout(() => {
    window.URL.revokeObjectURL(downloadUrl)
    document.body.removeChild(link)
  }, 0)
}
