import { ApiClient } from './helpers/apiClient.js';
import { EmbedBuilder } from './helpers/embedBuilder.js';
import { format_body, filter_leaderboard } from './helpers/leaderboardManager.js';
import { scheduleTask } from './helpers/scheduler.js';
import { readRecords } from './helpers/fileManager.js';

const env_param = process.env.TYPE;

async function compile_payload() {
    return new Promise(async (resolve, reject) => {
        const client = new ApiClient();
        const type = env_param || '86400';
        const leaderboard = await filter_leaderboard(client, type);
        if (!leaderboard) {
            reject('Error fetching leaderboard');
            return;
        }

        const { titleSuffix, descriptionIntro, nextUpdateTime } = await format_body(type);

        const emojis = ['🥇', '🥈', '🥉'];
        console.log(leaderboard)

        const fields = leaderboard.map((item, index) => {
            if (index < emojis.length) {
                const recordText = item.newRecord ? ' **( NEW RECORD!! )**' : '';
                return {
                    name: `${emojis[index]} ${item.username}`,
                    value: `**Rank**: ${item.overall_rank}\n**Total XP**: ${item.overall_diff.toLocaleString()}${recordText}`,
                    inline: false
                };
            }
        }).filter(field => field !== undefined);

        const embed = new EmbedBuilder()
            .setTitle(`<:Total:1233040561599156254> Vidyascape ${titleSuffix} Leaderboard`)
            .setDescription(`${descriptionIntro}`)
            .setColor('#FFD700')
            .setThumbnail("https://community.moviebattles.org/data/avatars/h/0/375.jpg?1592876260")
            .setTimestamp()
            .setFooter('Next update: ' + nextUpdateTime.toLocaleString('en-US', {
                year: '2-digit', month: '2-digit', day: '2-digit',
                hour: '2-digit', minute: '2-digit', second: '2-digit',
                hour12: true
            }));

        fields.forEach(field => embed.addField(field.name, field.value, field.inline));

        const embedObject = embed.build(leaderboard);

        resolve(embedObject);

        console.log(embedObject);
    })
};

async function main() {
    let embed = await compile_payload();
    const webhook_url = "https://discord.com/api/webhooks/1233062280925806622/RqJgqFh4L5iOfQQwzCUBjQTmFRKYY_CQAwwA78LOlQmn32sLruDLtqTQX3s1_xuJV19l";

    try {
        const response = await fetch(webhook_url + '?wait=true', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ embeds: [embed] }),
            
        });

        if (response.ok) {
            console.log(`Webhook sent successfully.`);
            scheduleTask(env_param);
        } else {
            console.error(`Failed to send webhook: ${response.statusText}`);
        }
    } catch (error) {
        console.error(`Error sending webhook: ${error.message}`);
    }
}

main();